import React, { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import { Typography, Box, Button, CircularProgress } from '@mui/material';
import { Outlet } from 'react-router-dom';

const useUserGroups = () => {
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const session = await fetchAuthSession();
        const cognitoGroups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
        console.log('Cognito Groups:', cognitoGroups);
        setGroups(cognitoGroups as string[]);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return {
    isInGroup: (groupName: string) => groups.includes(groupName),
    groups,
    loading
  };
};

const AdminCheck: React.FC = () => {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { isInGroup, loading } = useUserGroups();
  const isAdmin = isInGroup('Administrator');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  console.log('User:', user);
  console.log('Is Admin:', isAdmin);
  if (!isAdmin) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <Typography variant="h4">
          Welcome, {user?.username}
        </Typography>
        <Typography variant="body1">
          You are not authorized to access the admin portal.
        </Typography>
        <Button variant="contained" onClick={signOut}>
          Sign Out
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Outlet />
    </>
  );
};

export default AdminCheck;
