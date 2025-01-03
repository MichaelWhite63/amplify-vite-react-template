import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { TextField, Button, List, ListItem, ListItemText, Radio, Card, CardContent, Typography, Chip, Stack, Divider, Checkbox, FormGroup, FormControlLabel } from '@mui/material';

const client = generateClient<Schema>();

const User: React.FC = () => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [groupMemberships, setGroupMemberships] = useState<string[]>([]);
  const availableGroups = ['Steel', 'Auto', 'Aluminum'];

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
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleGroupChange = (group: string) => {
    setGroupMemberships(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const handleSelectUser = async (email: string) => {
    setSelectedEmail(email);
    console.log('email', email);
    try {
      const response = await client.queries.getUser({ name: email });
      console.log('response', response);
      const data = response.data ? JSON.parse(response.data) : [];
      setSelectedDetails(data);
      setGroupMemberships(data[0]?.GroupMemberships || []);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <TextField
        label="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button variant="contained" onClick={handleSearchUsers} style={{ marginLeft: '10px' }}>
        Get User
      </Button>
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
      {selectedDetails && selectedDetails[0] && (
        <Card sx={{ mt: 3, maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <Typography>
                <strong>Email:</strong> {selectedDetails[0].Attributes.find((attr: any) => attr.Name === 'email')?.Value}
              </Typography>
              
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
                  Group Memberships:
                </Typography>
                <FormGroup row>
                  {availableGroups.map((group) => (
                    <FormControlLabel
                      key={group}
                      control={
                        <Checkbox
                          checked={groupMemberships.includes(group)}
                          onChange={() => handleGroupChange(group)}
                        />
                      }
                      label={group}
                    />
                  ))}
                </FormGroup>
              </div>

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
  );
};

export default User;