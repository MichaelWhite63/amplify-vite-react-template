import React, { useState, useEffect } from 'react';
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

  // Function to generate password
  const generatePassword = () => {
    // Generate three random numbers
    const randomNumbers = Math.floor(Math.random() * 900 + 100); // 100-999
    const generatedPassword = `Metal${randomNumbers}`;
    return generatedPassword;
  };

  // Auto-generate password when username is entered
  useEffect(() => {
    if (username.trim()) {
      const password = generatePassword();
      setNewPassword(password);
      setConfirmPassword(password); // Also set confirm password field
    }
  }, [username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Reset messages when input changes
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
    
    // Simplified validation for our specific password format
    if (!newPassword.startsWith('Metal') || !/Metal\d{3}$/.test(newPassword)) {
      setError('Password must start with "Metal" and end with three numbers');
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

  // Function to regenerate password
  const handleRegeneratePassword = () => {
    if (username.trim()) {
      const password = generatePassword();
      setNewPassword(password);
      setConfirmPassword(password);
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                sx={{
                  '& .MuiInputLabel-root': textStyle,
                  '& .MuiInputBase-input': textStyle,
                  my: 2,
                  flex: 1
                }}
                fullWidth
                type="text" // Changed to text so user can see the generated password
                label="新しいパスワード"
                value={newPassword}
                InputProps={{
                  readOnly: true,
                }}
                disabled={loading}
                required
                helperText="Metal から始まり 3 桁の数字で終わるパスワード"
              />
              
              <Button 
                variant="outlined" 
                onClick={handleRegeneratePassword}
                disabled={!username.trim() || loading}
                sx={{ height: 56 }}
              >
                再生成
              </Button>
            </Box>
            
            <TextField
              sx={{
                '& .MuiInputLabel-root': textStyle,
                '& .MuiInputBase-input': textStyle,
                my: 2
              }}
              fullWidth
              type="text" // Changed to text for visibility
              label="新しいパスワードの確認"
              value={confirmPassword}
              InputProps={{
                readOnly: true,
              }}
              disabled={loading}
              required
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !username.trim()}
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
