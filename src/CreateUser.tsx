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
import { Authenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    name: '',
    department: '', // Add department field
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

    if (!formData.company || !formData.email || !formData.name || !formData.department) {
      setError('Company, email, name, and department are required');
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
        email: formData.email,
        name: formData.name,
        company: formData.company,
        department: formData.department, // Add department to API call
        groups: selectedGroups
      });

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0].message);
      }
      setSuccess(true);
      setFormData({
        company: '',
        email: '',
        name: '',
        department: '', // Add department to reset
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
  /**
   * name       -> name
   * company     -> last_name
   * department -> given_name
   */

  return (
    <Authenticator>
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
                  name="name"
                  label="名前"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
                
                <TextField
                  name="company"
                  label="会社名"
                  value={formData.company}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />

                <TextField
                  name="department"
                  label="部署"
                  value={formData.department}
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
    </Authenticator>
  );
};

export default CreateUser;