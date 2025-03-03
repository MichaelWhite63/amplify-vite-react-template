import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { TextField, Button, List, ListItem, ListItemText, Radio, Card, CardContent, Typography, Chip, Stack, Divider, Checkbox, FormGroup, FormControlLabel, Box } from '@mui/material';
import NewsAppBar from './components/NewsAppBar';
import { Authenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

const UpdateUser: React.FC = () => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [groupMemberships, setGroupMemberships] = useState<string[]>([]);
  
  const GROUP_MAPPING = {
    '鉄鋼': 'Steel',
    '自動車': 'Auto',
    'アルミ': 'Aluminum'
  } as const;
  
  const availableGroups = ['鉄鋼', '自動車', 'アルミ'];
  const [editableEmail, setEditableEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');  
  const [familyName, setFamilyName] = useState('');
  const [givenName, setGivenName] = useState('');

  const handleSearchUsers = async () => {
    console.log('name', name);
    
    try {
      const response = await client.queries.searchUsers({ name });
      console.log('response', response);
      console.log(response);
      const data = response.data ? JSON.parse(response.data) : [];
      const emails = data.map((user: { Attributes: { Name: string; Value: string }[] }) => {
        const emailAttr = user.Attributes.find((attr: { Name: string; Value: string }) => attr.Name === 'email');
        return emailAttr ? emailAttr.Value : 'No email found';
      });
      setUsers(emails);
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
    setOriginalEmail(email);  
    setUsers([]);

    try {
      const response = await client.queries.searchUsers({ name: email });
      const data = response.data ? JSON.parse(response.data) : [];
      setSelectedDetails(data);
      setGroupMemberships(data[0]?.GroupMemberships || []);
      
      const attributes = data[0]?.Attributes || [];
      const familyNameAttr = attributes.find((attr: { Name: string; Value: string }) => attr.Name === 'family_name');
      const givenNameAttr = attributes.find((attr: { Name: string; Value: string }) => attr.Name === 'given_name');
      setFamilyName(familyNameAttr?.Value || '');
      setGivenName(givenNameAttr?.Value || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDetails?.[0]) return;
    
    try {
      const response = await client.queries.updateUser({ 
        username: originalEmail,     // Cognito Username (identifier)
        email: editableEmail,        // new email
        givenName: givenName,        // Company Name
        familyName: familyName,      // renamed from lastName
        groups: groupMemberships
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      await handleSelectUser(editableEmail);

    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <Authenticator>
      <NewsAppBar />
      <Box sx={{ 
        mt: '130px', // Add margin top to account for NewsAppBar and logo
        mx: 3 // Add horizontal margin
      }}>
        <div style={{ margin: '20px' }}>
          <TextField
            label="Enter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button variant="contained" onClick={handleSearchUsers} style={{ marginLeft: '10px' }}>
            Get User
          </Button>
          {!selectedDetails && (
            <List>
              {users.map((email, idx) => (
                <ListItem key={idx}>
                  <Radio
                    checked={selectedEmail === email}
                    onChange={() => handleSelectUser(email)}
                  />
                  <ListItemText primary={email} />
                </ListItem>
              ))}
            </List>
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
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="会社名"
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                    fullWidth
                  />
                  
                  <Typography>
                    <strong>Status:</strong> {selectedDetails[0].UserStatus}
                    {selectedDetails[0].Enabled && <Chip 
                      size="small" 
                      color="success" 
                      label="Enabled" 
                      sx={{ ml: 1 }} 
                    />}
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
                    Update User
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
    </Authenticator>
  );
};

export default UpdateUser;