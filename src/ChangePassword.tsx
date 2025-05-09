import React, { useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

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
      // Call the Lambda function through AppSync API
      const response = await client.queries.changeUserPassword({
        username,
        password: newPassword
      });
      
      // Clear form on success
      setUsername('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(response.data.message || `Password for user ${username} has been successfully changed.`);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Authenticator>
      {({ user }) => {
        if (!user) return <Typography>Please sign in...</Typography>;
        
        return (
          <Box width="100%" mx="auto" mt={4}>
            <Paper elevation={3} style={{ padding: '20px', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Change User Password
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
                  label="Username"
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
                  label="New Password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  disabled={loading}
                  required
                  helperText="Must contain at least 8 characters, including uppercase, lowercase, number, and special character"
                />
                
                <TextField
                  sx={{
                    '& .MuiInputLabel-root': textStyle,
                    '& .MuiInputBase-input': textStyle,
                    my: 2
                  }}
                  fullWidth
                  type="password"
                  label="Confirm New Password"
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
        );
      }}
    </Authenticator>
  );
};

export default ChangePassword;
