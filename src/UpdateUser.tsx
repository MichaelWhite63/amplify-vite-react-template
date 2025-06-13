import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { TextField, Button, Radio, Card, CardContent, Typography, Chip, Stack, Divider, Checkbox, FormGroup, FormControlLabel, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Pagination } from '@mui/material';
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
  const [searchName, setSearchName] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [groupMemberships, setGroupMemberships] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [nextToken, setNextToken] = useState<string>('');
  const [hasMoreData, setHasMoreData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 20; // Fixed page size
  
  const GROUP_MAPPING = {
    '鉄鋼': 'Steel',
    '自動車': 'Auto',
    'アルミ': 'Aluminum'
  } as const;
  
  const availableGroups = ['鉄鋼', '自動車', 'アルミ'];
  const [editableEmail, setEditableEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [company, setCompany] = useState('');

  const handleSearchUsers = async (page: number = 1, token: string = '') => {
    console.log('=== SEARCH USERS DEBUG ===');
    console.log('Input params:', { searchName, page, token });
    console.log('Current state before search:', { currentPage, nextToken, hasMoreData });
    
    setIsLoading(true);
    
    try {
      const requestParams = { 
        name: searchName,
        pageSize: pageSize,
        nextToken: token
      };
      
      console.log('Sending request with params:', requestParams);
      
      const response = await client.queries.searchUsers(requestParams);
      
      console.log('Raw search response:', response);
      
      if (response.data) {
        const data = JSON.parse(response.data);
        
        console.log('Parsed response data:', data);
        console.log('Response structure check:', {
          hasUsers: !!data.users,
          usersIsArray: Array.isArray(data.users),
          usersLength: data.users?.length || 0,
          hasNextToken: !!data.nextToken,
          nextTokenValue: data.nextToken
        });
        
        // Check if we're getting the same users
        if (data.users && data.users.length > 0) {
          const firstUserEmail = data.users[0]?.Attributes?.find(attr => attr.Name === 'email')?.Value;
          const lastUserEmail = data.users[data.users.length - 1]?.Attributes?.find(attr => attr.Name === 'email')?.Value;
          console.log('First user email:', firstUserEmail);
          console.log('Last user email:', lastUserEmail);
        }
        
        // Check if response has pagination structure
        let userList, newNextToken;
        if (data.users && Array.isArray(data.users)) {
          userList = data.users;
          newNextToken = data.nextToken;
          console.log('Using paginated response structure');
        } else if (Array.isArray(data)) {
          userList = data;
          newNextToken = null;
          console.log('Using direct array response structure');
        } else {
          userList = [];
          newNextToken = null;
          console.log('No valid response structure found');
        }
        
        console.log('Final userList length:', userList.length);
        console.log('Final newNextToken:', newNextToken);
        
        const userDetails = userList.map((user: { Attributes: { Name: string; Value: string }[] }) => {
          const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
          const nameAttr = user.Attributes?.find(attr => attr.Name === 'name');
          const familyNameAttr = user.Attributes?.find(attr => attr.Name === 'family_name');
          const givenNameAttr = user.Attributes?.find(attr => attr.Name === 'given_name');
          
          return {
            email: emailAttr?.Value || 'No email found',
            name: nameAttr?.Value || '',
            familyName: familyNameAttr?.Value || '',
            givenName: givenNameAttr?.Value || ''
          };
        });
        
        console.log('Final userDetails:', userDetails);
        
        // Update all state together and force re-render
        setUsers(userDetails);
        setNextToken(newNextToken || '');
        setHasMoreData(!!newNextToken);
        setCurrentPage(page);
        setSelectedDetails(null); // Clear any selected user details
        
        console.log('State updated - users:', userDetails.length, 'hasMore:', !!newNextToken);
        
      } else {
        console.log('No response.data found');
        setUsers([]);
        setNextToken('');
        setHasMoreData(false);
        setSelectedDetails(null);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setSelectedDetails(null);
    } finally {
      setIsLoading(false);
      console.log('Search completed, isLoading set to false');
    }
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, page: number) => {
    console.log('handlePageChange called:', { page, currentPage, hasMoreData, nextToken });
    
    if (page > currentPage && hasMoreData) {
      console.log('Going to next page with token:', nextToken);
      await handleSearchUsers(page, nextToken);
    } else if (page < currentPage) {
      console.log('Going to previous page - searching from beginning');
      await handleSearchUsers(1, '');
    } else {
      console.log('Page change not executed:', { page, currentPage, hasMoreData });
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
    setName(email);
    setUsers([]);

    try {
      const response = await client.queries.searchUsers({ 
        name: email,
        pageSize: 1,
        nextToken: ''
      });
      
      const data = response.data ? JSON.parse(response.data) : [];
      
      // Handle both paginated and non-paginated responses
      const userList = data.users || data;
      setSelectedDetails(userList);
      console.log('User details:', userList);
      setGroupMemberships(userList[0]?.GroupMemberships || []);
      
      const attributes = userList[0]?.Attributes || [];
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
      setCurrentPage(1);
      setNextToken('');
      setHasMoreData(false);

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
      setCurrentPage(1);
      setNextToken('');
      setHasMoreData(false);

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

  // Add this right before the return statement
  console.log('Render state:', {
    selectedDetails: !!selectedDetails,
    usersLength: users.length,
    isLoading,
    searchName
  });

  useEffect(() => {
    console.log('Users state changed:', {
      usersLength: users.length,
      currentPage,
      hasMoreData,
      nextToken: nextToken.substring(0, 20),
      selectedDetails: !!selectedDetails
    });
  }, [users, currentPage, hasMoreData, nextToken, selectedDetails]);

  return (
    <Authenticator>
      <NewsAppBar />
      <Box sx={{ 
        mt: '130px',
        mx: 3
      }}>
        <div style={{ margin: '20px' }}>
          {/* Search input and button */}
          <TextField
            sx={{
              '& .MuiInputLabel-root': { fontSize: '2.0rem', fontWeight: 'bold' },
              '& .MuiInputBase-input': { fontSize: '2.0rem', fontWeight: 'bold' },
            }}
            label="名前を入力してください"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            variant="contained" 
            onClick={() => handleSearchUsers(1, '')} 
            disabled={isLoading}
            sx={{ 
              marginLeft: '10px',
              padding: '10px 30px',
              fontSize: '1.2rem'
            }}
          >
            {isLoading ? '検索中...' : '検索'}
          </Button>
          
          {/* Debug info - remove this later */}
          <Typography sx={{ mt: 2, color: 'red' }}>
            Debug: selectedDetails={selectedDetails ? 'exists' : 'null'}, 
            users.length={users.length}, 
            isLoading={isLoading.toString()}
          </Typography>
          
          {!selectedDetails && users.length > 0 && (
            <>
              <Typography sx={{ mt: 2, color: 'green' }}>
                Found {users.length} users - showing table (Page {currentPage})
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2, width: '100%' }} key={`users-${currentPage}-${users.length}`}>
                <Table sx={{ 
                  '& .MuiTableCell-root': { fontSize: '1.5rem', padding: '16px' },
                  width: '100%',
                  tableLayout: 'fixed'
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" sx={{ width: '5%' }}></TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>メール</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>名前</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>会社名</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>部署</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user, idx) => (
                      <TableRow key={`${user.email}-${currentPage}-${idx}`} hover>
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
              
              {/* Enhanced pagination controls with more debugging */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button 
                    variant="outlined" 
                    disabled={currentPage === 1 || isLoading}
                    onClick={() => handlePageChange({} as any, 1)}
                  >
                    最初
                  </Button>
                  <Button 
                    variant="outlined" 
                    disabled={!hasMoreData || isLoading}
                    onClick={() => {
                      console.log('Next page clicked:', { currentPage, hasMoreData, nextToken });
                      handlePageChange({} as any, currentPage + 1);
                    }}
                  >
                    次のページ
                  </Button>
                  <Typography>
                    ページ {currentPage} ({users.length} 件表示)
                    {hasMoreData && ' - さらに結果があります'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'gray' }}>
                    Debug: hasMore={hasMoreData.toString()}, token={nextToken.substring(0, 10)}...
                  </Typography>
                </Stack>
              </Box>
            </>
          )}
          
          {!selectedDetails && users.length === 0 && !isLoading && searchName && (
            <Typography sx={{ mt: 2, fontSize: '1.2rem' }}>
              検索結果が見つかりませんでした。
            </Typography>
          )}
          
          {/* Rest of the existing user details form code remains the same */}
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