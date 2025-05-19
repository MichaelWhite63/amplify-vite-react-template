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
  Box,
  Radio,
  Divider
} from '@mui/material';
import NewsAppBar from './components/NewsAppBar';
import { Authenticator } from '@aws-amplify/ui-react';

// Add form text style for consistent 14pt font sizing
const formTextStyle = {
  fontSize: '14pt',
  '& .MuiInputLabel-root': { fontSize: '14pt' },
  '& .MuiInputBase-input': { fontSize: '14pt' },
  '& .MuiFormLabel-root': { fontSize: '14pt' },
  '& .MuiTypography-root': { fontSize: '14pt' },
  '& .MuiFormControlLabel-label': { fontSize: '14pt' }
};

const client = generateClient<Schema>();

const CreateUser: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    name: '',
    department: '',
    groups: {
      Steel: false,
      Auto: false,
      Aluminum: false
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

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
      setAllSelected(Object.values({
        ...formData.groups,
        [groupName]: e.target.checked
      }).every(Boolean));
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
    setError(null);
    setSuccess(false);
  };

  const handleSelectAll = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);
    setFormData(prev => ({
      ...prev,
      groups: {
        Steel: newValue,
        Auto: newValue,
        Aluminum: newValue
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.company || !formData.email || !formData.name || !formData.department) {
      setError('Company, email, name, and notes are required');
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
        department: formData.department,
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
        department: '',
        groups: {
          Steel: false,
          Auto: false,
          Aluminum: false
        }
      });
      setAllSelected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the user');
    }
  };

  return (
    <Authenticator>
      <NewsAppBar />
      <Box sx={{ mt: '130px' }}>
        <Card sx={{ width: '6in', mx: 'auto', mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontSize: '16pt' }}>
              新しいユーザーの作成
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
                  sx={formTextStyle}
                />
                
                <TextField
                  name="name"
                  label="名前"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={formTextStyle}
                />
                
                <TextField
                  name="company"
                  label="会社名"
                  value={formData.company}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={formTextStyle}
                />

                <TextField
                  name="department"
                  label="注意事項"
                  value={formData.department}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  sx={formTextStyle}
                />

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                  control={
                    <Radio 
                      checked={allSelected}
                      onClick={(e) => {
                        if (allSelected) {
                          e.preventDefault();
                          handleSelectAll();
                        }
                      }}
                      onChange={handleSelectAll}
                    />
                  }
                  label="すべてのカテゴリ"
                  sx={formTextStyle}
                />
                
                <FormGroup>
                  <FormLabel component="legend" sx={{ fontSize: '14pt' }}></FormLabel>
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
                      sx={formTextStyle}
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
                      sx={formTextStyle}
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
                      sx={formTextStyle}
                    />
                  </Stack>
                </FormGroup>

                {error && (
                  <Alert severity="error" sx={{ '& .MuiAlert-message': { fontSize: '14pt' } }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ '& .MuiAlert-message': { fontSize: '14pt' } }}>
                    User created successfully!
                  </Alert>
                )}

                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={{ fontSize: '14pt', py: 1 }}
                >
                  ユーザーの作成
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