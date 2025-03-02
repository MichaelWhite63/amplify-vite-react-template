import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Alert,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Box
} from '@mui/material';
import NewsAppBar from './components/NewsAppBar';

const client = generateClient<Schema>();

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    lastName: '',
    groups: {
      Steel: false,
      Auto: false,
      Aluminum: false
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name.startsWith('group-')) {
      const groupName = e.target.name.replace('group-', '');
      setFormData(prev => ({
        ...prev,
        groups: {
          ...prev.groups,
          [groupName]: e.target.checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.username || !formData.email || !formData.lastName) {
      setError('Username, email, and last name are required');
      return;
    }

    const selectedGroups = Object.entries(formData.groups)
      .filter(([_, checked]) => checked)
      .map(([group]) => group);

    if (selectedGroups.length === 0) {
      setError('Please select at least one group');
      return;
    }

    try {
      const response = await client.queries.createUser({
        lastName: formData.lastName,  // Person Name
        username: formData.username,  //Company
        email: formData.email,
        groups: selectedGroups
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      setSuccess(true);
      setFormData({
        username: '',
        email: '',
        lastName: '',
        groups: {
          Steel: false,
          Auto: false,
          Aluminum: false
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the user');
    }
  };

  return (
    <>
      <NewsAppBar />
      <Box sx={{ mt: '130px' }}> {/* Add margin top to account for NewsAppBar */}
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Create New User
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  name="email"
                  label="メールアドレス"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                
                <TextField
                  name="lastName"
                  label="名前"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                
                <TextField
                  name="username"
                  label="会社名"
                  value={formData.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                
                <FormGroup>
                  <FormLabel component="legend">カテゴリー</FormLabel>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={formData.groups.Steel}
                          onChange={handleInputChange}
                          name="group-Steel"
                        />
                      }
                      label="鉄鋼"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={formData.groups.Auto}
                          onChange={handleInputChange}
                          name="group-Auto"
                        />
                      }
                      label="自動車"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={formData.groups.Aluminum}
                          onChange={handleInputChange}
                          name="group-Aluminum"
                        />
                      }
                      label="アルミ"
                    />
                  </Stack>
                </FormGroup>

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
      </Box>
    </>
  );
};

export default CreateUser;