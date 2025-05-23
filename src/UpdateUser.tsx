import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { TextField, Button, Radio, Card, CardContent, Typography, Chip, Stack, Divider, Checkbox, FormGroup, FormControlLabel, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import NewsAppBar from './components/NewsAppBar';
import { Authenticator } from '@aws-amplify/ui-react';

interface UserSearchResult {
  email: string;
  name: string;
  familyName: string;
  givenName: string;
}

const client = generateClient<Schema>();

const UpdateUser: React.FC = () => {
  const [searchName, setSearchName] = useState(''); // New state for search
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [groupMemberships, setGroupMemberships] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for delete confirmation dialog
  
  const GROUP_MAPPING = {
    '鉄鋼': 'Steel',
    '自動車': 'Auto',
    'アルミ': 'Aluminum'
  } as const;
  
  const availableGroups = ['鉄鋼', '自動車', 'アルミ'];
  const [editableEmail, setEditableEmail] = useState('');
  const [name, setName] = useState('');  // Changed from originalEmail
  const [department, setDepartment] = useState('');
  const [company, setCompany] = useState('');

  const handleSearchUsers = async () => {
    console.log('name', searchName); // Changed from name
    
    try {
      const response = await client.queries.searchUsers({ name: searchName }); // Changed from name
      console.log('response', response);
      console.log(response);
      const data = response.data ? JSON.parse(response.data) : [];
      const userDetails = data.map((user: { Attributes: { Name: string; Value: string }[] }) => {
        const emailAttr = user.Attributes.find(attr => attr.Name === 'email');
        const nameAttr = user.Attributes.find(attr => attr.Name === 'name');
        const familyNameAttr = user.Attributes.find(attr => attr.Name === 'family_name');
        const givenNameAttr = user.Attributes.find(attr => attr.Name === 'given_name');
        
        return {
          email: emailAttr?.Value || 'No email found',
          name: nameAttr?.Value || '',
          familyName: familyNameAttr?.Value || '',
          givenName: givenNameAttr?.Value || ''
        };
      });
      setUsers(userDetails);
      setSelectedDetails(false);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleGroupChange = (group: string) => {
    const englishGroup = GROUP_MAPPING[group as keyof typeof GROUP_MAPPING];
    setGroupMemberships(prev => 
      prev.includes(englishGroup) 
        ? prev.filter(g => g !== englishGroup)
        : [...prev, englishGroup]
    );
  };

  const handleSelectUser = async (email: string) => {
    setSelectedEmail(email);
    setEditableEmail(email);  
    setName(email);  // Changed from setOriginalEmail
    setUsers([]);

    try {
      const response = await client.queries.searchUsers({ name: email });
      const data = response.data ? JSON.parse(response.data) : [];
      setSelectedDetails(data);
      console.log('data', data);
      setGroupMemberships(data[0]?.GroupMemberships || []);
      
      const attributes = data[0]?.Attributes || [];
      const departmentAttr = attributes.find((attr: { Name: string; Value: string }) => attr.Name === 'given_name');
      const companyAttr = attributes.find((attr: { Name: string; Value: string }) => attr.Name === 'family_name');
      const nameAttr = attributes.find((attr: { Name: string; Value: string }) => attr.Name === 'name');
      setDepartment(departmentAttr?.Value || '');
      setCompany(companyAttr?.Value || '');
      setName(nameAttr?.Value || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDetails?.[0]) return;
    
    try {
      const response = await client.queries.updateUser({ 
        email: editableEmail,
        name: name,
        company: company,
        department: department,
        groups: groupMemberships
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // Reset all state to initial values
      setSearchName('');
      setUsers([]);
      setSelectedEmail('');
      setSelectedDetails(null);
      setGroupMemberships([]);
      setEditableEmail('');
      setName('');
      setDepartment('');
      setCompany('');

    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedDetails?.[0]) return;
    
    try {
      const response = await client.queries.deleteUser({ 
        email: editableEmail
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }

      // Reset all state to initial values
      setSearchName('');
      setUsers([]);
      setSelectedEmail('');
      setSelectedDetails(null);
      setGroupMemberships([]);
      setEditableEmail('');
      setName('');
      setDepartment('');
      setCompany('');
      setDeleteDialogOpen(false);

      // Show success notification
      alert("ユーザーが正常に削除されました");

    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`エラー：${error instanceof Error ? error.message : '不明なエラーが発生しました'}`);
    }
  };

  const DeleteConfirmationDialog = () => (
    <Dialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"ユーザー削除の確認"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {`${editableEmail} を削除してもよろしいですか？ この操作は元に戻せません。`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
          キャンセル
        </Button>
        <Button onClick={handleDeleteUser} color="error" autoFocus>
          削除する
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Authenticator>
      <NewsAppBar />
      <Box sx={{ 
        mt: '130px', // Add margin top to account for NewsAppBar and logo
        mx: 3 // Add horizontal margin
      }}>
        <div style={{ margin: '20px' }}>
          <TextField
            sx={{
              '& .MuiInputLabel-root': { fontSize: '2.0rem', fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontSize: '2.0rem', fontWeight: 'bold' },
            }}
            label="名前を入力してください"
            value={searchName}  // Changed from name
            onChange={(e) => setSearchName(e.target.value)}  // Changed from setName
          />
          <Button 
            variant="contained" 
            onClick={handleSearchUsers} 
            sx={{ 
              marginLeft: '10px',
              padding: '10px 30px',
              fontSize: '1.2rem'
            }}
          >
            検索
          </Button>
          {!selectedDetails && (
            <TableContainer component={Paper} sx={{ mt: 2, width: '100%' }}>
              <Table sx={{ 
                '& .MuiTableCell-root': { fontSize: '1.5rem', padding: '16px' },
                width: '100%',
                tableLayout: 'fixed'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: '5%' }}></TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>メール</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>名前</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>会社名</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>部署</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell padding="checkbox">
                        <Radio
                          checked={selectedEmail === user.email}
                          onChange={() => handleSelectUser(user.email)}
                        />
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.familyName}</TableCell>
                      <TableCell>{user.givenName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {selectedDetails && selectedDetails[0] && (
            <Card sx={{ mt: 3, maxWidth: 600 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    value={editableEmail}
                    disabled
                    sx={{ bgcolor: 'action.disabledBackground' }}
                    fullWidth
                  />
                  <TextField
                    label="名前"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="会社名"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="注意事項"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    fullWidth
                  />
                  
                  <Typography>
                    <strong>Status:</strong> {selectedDetails[0].UserStatus}
                  </Typography>
                  
                  <Typography>
                    <strong>Account Status:</strong> 
                    {selectedDetails[0].Enabled ? (
                      <Chip 
                        size="small" 
                        color="success" 
                        label="Enabled" 
                        sx={{ ml: 1 }} 
                      />
                    ) : (
                      <Chip 
                        size="small" 
                        color="error" 
                        label="Disabled" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>

                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                    メール配信グループ
                    </Typography>
                    <FormGroup row>
                      {availableGroups.map((group) => (
                        <FormControlLabel
                          key={group}
                          control={
                            <Checkbox
                              checked={groupMemberships.includes(GROUP_MAPPING[group as keyof typeof GROUP_MAPPING])}
                              onChange={() => handleGroupChange(group)}
                            />
                          }
                          label={group}
                        />
                      ))}
                    </FormGroup>
                  </div>

                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleUpdate}
                    sx={{ mt: 2 }}
                  >
                    ユーザーの更新
                  </Button>

                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ mt: 2, ml: 2 }}
                  >
                    ユーザーの削除
                  </Button>

                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(selectedDetails[0].UserCreateDate).toLocaleDateString()}
                    <br />
                    Last Modified: {new Date(selectedDetails[0].UserLastModifiedDate).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
        </div>
      </Box>
      <DeleteConfirmationDialog />
    </Authenticator>
  );
};

export default UpdateUser;