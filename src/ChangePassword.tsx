import React, { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import NewsAppBar from './components/NewsAppBar';

// Initialize the client
const client = generateClient<Schema>();

// Style consistent with other components
const textStyle = {
  fontWeight: 'bold',
  fontSize: '1.2rem'
};

const ChangePassword: React.FC = () => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Reset messages when input changes
    setError(null);
    setSuccess(null);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!newPassword) {
      setError('New password is required');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // AWS Cognito password requirements
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    
    if (!(hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)) {
      setError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Reset previous status
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
    
      // The schema defines changeUserPassword as returning a string
      const response = await client.queries.changeUserPassword({
        username,
        password: newPassword
      });
      
      // Log the response for debugging
      console.log('API Response:', response);
      
      // Clear form on success
      setUsername('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Response contains a data property that holds the string result
      setSuccess(response.data || `Password for user ${username} has been successfully changed.`);
    } catch (err: unknown) {
      console.error('Error changing password:', err);
      setError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Authenticator>
      <NewsAppBar />
      <Box sx={{ mt: '130px' }}>
        <Paper elevation={3} style={{ padding: '20px', width: '6in', margin: '0 auto' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            ユーザーパスワードの変更
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ my: 2 }}>
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              sx={{
                '& .MuiInputLabel-root': textStyle,
                '& .MuiInputBase-input': textStyle,
                my: 2
              }}
              fullWidth
              label="ユーザー名"
              value={username}
              onChange={handleUsernameChange}
              disabled={loading}
              required
            />
            
            <TextField
              sx={{
                '& .MuiInputLabel-root': textStyle,
                '& .MuiInputBase-input': textStyle,
                my: 2
              }}
              fullWidth
              type="password"
              label="新しいパスワード"
              value={newPassword}
              onChange={handleNewPasswordChange}
              disabled={loading}
              required
              helperText="大文字、小文字、数字、特殊文字を含む 8 文字以上である必要があります"
            />
            
            <TextField
              sx={{
                '& .MuiInputLabel-root': textStyle,
                '& .MuiInputBase-input': textStyle,
                my: 2
              }}
              fullWidth
              type="password"
              label="新しいパスワードの確認"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={loading}
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, fontWeight: 'bold', fontSize: '1.2rem' }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Authenticator>
  );
};

export default ChangePassword;
