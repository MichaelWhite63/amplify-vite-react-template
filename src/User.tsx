import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { TextField, Button, List, ListItem, ListItemText, Radio } from '@mui/material';

const client = generateClient<Schema>();

const User: React.FC = () => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);

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

  const handleSelectUser = async (email: string) => {
    setSelectedEmail(email);
    try {
      const response = await client.queries.getUser({ name: email });
      const data = response.data ? JSON.parse(response.data) : [];
      setSelectedDetails(data);
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
      {selectedDetails && (
        <div>
          {/* Show selected user details here */}
          <pre>{JSON.stringify(selectedDetails, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default User;