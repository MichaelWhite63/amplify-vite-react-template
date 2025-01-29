import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './index.css';
import { fetchAuthSession } from '@aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { useEffect, useState } from 'react';

const useUserGroups = () => {
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchGroups(); // Initial fetch

    const listener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in');
          fetchGroups(); // Fetch groups when user signs in
          break;
        case 'signedOut':
          console.log('User signed out');
          setGroups([]); // Clear groups when user signs out
          break;
      }
    });

    return () => {
      listener(); // Clean up the listener when the component unmounts
    };
  }, []);

  return {
    isInGroup: (groupName: string) => groups.includes(groupName),
    loading
  };
};

const MenuComponent: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { isInGroup, loading } = useUserGroups();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading || !isInGroup('Administrator')) {
    console.log('Menu Component Returning Null Administrator => ' + isInGroup('Administrator'));
    return null;
  }

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'ホーム';  // Updated title
      case '/news-entry': return 'ニュースの作成';
      case '/news-search': return 'ニュースの検索';
      case '/charts': return 'チャートの編集';
      case '/send-email': return 'ニュースの配信をする';
      case '/update-users': return 'ユーザーの検索';
      case '/create-user': return 'ユーザーの作成';
      default: return 'Admin Portal';
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 0 }}>
            {getPageTitle(location.pathname)}
          </Typography>
          <Typography variant="h6" sx={{ visibility: 'hidden' }}>
            <MenuIcon />
          </Typography>
        </Toolbar>
      </AppBar>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleNavigation('/')} sx={{ color: 'white' }}>ホーム</MenuItem>
        <MenuItem onClick={() => handleNavigation('/news-entry')} sx={{ color: 'white' }}>ニュースの作成</MenuItem>
        <MenuItem onClick={() => handleNavigation('/news-search')} sx={{ color: 'white' }}>ニュースの検索</MenuItem>
        <MenuItem onClick={() => handleNavigation('/send-email')} sx={{ color: 'white' }}>ニュースの配信をする</MenuItem>
        <MenuItem onClick={() => handleNavigation('/charts')} sx={{ color: 'white' }}>チャートの編集</MenuItem>
        <MenuItem onClick={() => handleNavigation('/create-user')} sx={{ color: 'white' }}>ユーザーの作成</MenuItem>
        <MenuItem onClick={() => handleNavigation('/update-users')} sx={{ color: 'white' }}>ユーザーの検索</MenuItem>
      </Menu>
    </>
  );
};

export default MenuComponent;