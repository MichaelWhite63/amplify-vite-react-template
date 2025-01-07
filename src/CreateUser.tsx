import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { TextField, Button, Card, CardContent, Typography, Stack, Alert } from '@mui/material';

const client = generateClient<Schema>();

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    groups: '',
    lastName: ''  // Add lastName to state
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.username || !formData.email || !formData.groups || !formData.lastName) {
      setError('All fields are required');
      return;
    }

    try {
      // Convert comma-separated groups string to array
      const groupsArray = formData.groups.split(',').map(g => g.trim());
      const groups = groupsArray.join(', ');
      console.log(`Creating user with username: ${formData.username}, email: ${formData.email}, groups: ${groups}, lastName: ${formData.lastName}`);  // eslint-disable-line

      const response = await client.queries.createUser({
        username: formData.username,
        email: formData.email,
        groups: groupsArray,
        lastName: formData.lastName  // Add lastName to query
      });
      console.log('User created:', response);  // eslint-disable-line
      setSuccess(true);
      setFormData({ username: '', email: '', groups: '', lastName: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the user');
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create New User
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              fullWidth
              required
            />
            
            <TextField
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            
            <TextField
              name="groups"
              label="Groups"
              value={formData.groups}
              onChange={handleInputChange}
              fullWidth
              required
              helperText="Enter groups separated by commas (e.g., admin,user,editor)"
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                User created successfully!
              </Alert>
            )}

            <Button 
              type="submit"
              variant="contained" 
              color="primary"
              size="large"
            >
              Create User
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUser;