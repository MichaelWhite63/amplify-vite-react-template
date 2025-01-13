import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './index.css';
import { useNavigate, Route, Routes, useLocation } from 'react-router-dom';
import Charts from './Charts';
import SendEmail from './sendEmail';
import App from './App';
import NewsSearch from './newsSearch';
import UpdateUser from './UpdateUser';
import CreateUser from './CreateUser';

const MenuComponent: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/news-entry': return 'ニュースの作成';
      case '/news-search': return 'ニュースの検索';
      case '/charts': return 'チャートの編集';
      case '/send-email': return 'ニュースの配信をする';
      case '/update-users': return 'ユーザーの検索';
      case '/create-user': return 'ユーザーの作成';
      default: return 'News Entry';
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
        <MenuItem onClick={() => handleNavigation('/news-entry')} sx={{ color: 'white' }}>ニュースの作成</MenuItem>
        <MenuItem onClick={() => handleNavigation('/news-search')} sx={{ color: 'white' }}>ニュースの検索</MenuItem>
        <MenuItem onClick={() => handleNavigation('/send-email')} sx={{ color: 'white' }}>ニュースの配信をする</MenuItem>
        <MenuItem onClick={() => handleNavigation('/charts')} sx={{ color: 'white' }}>チャートの編集</MenuItem>
        <MenuItem onClick={() => handleNavigation('/create-user')} sx={{ color: 'white' }}>ユーザーの作成</MenuItem>
        <MenuItem onClick={() => handleNavigation('/update-users')} sx={{ color: 'white' }}>ユーザーの検索</MenuItem>
      </Menu>
      <Routes>
        <Route path="/send-email" element={<SendEmail />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/news-entry" element={<App />} />
        <Route path="/" element={<App />} />
        <Route path="/news-search" element={<NewsSearch />} />
        <Route path="/update-users" element={<UpdateUser />} />
        <Route path="/create-user" element={<CreateUser />} />
      </Routes>
    </>
  );
};

export default MenuComponent;