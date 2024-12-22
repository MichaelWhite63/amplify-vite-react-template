import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './index.css';
import { useNavigate, Route, Routes } from 'react-router-dom';
import Charts from './Charts';
import SendEmail from './sendEmail';
import App from './App';
import NewsSearch from './newsSearch';

const MenuComponent: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const navigate = useNavigate();

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
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            My App
          </Typography>
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
            <MenuItem onClick={() => handleNavigation('/news-entry')} sx={{ color: 'red' }}>News Entry</MenuItem>
            <MenuItem onClick={() => handleNavigation('/news-search')} sx={{ color: 'green' }}>News Search</MenuItem>
            <MenuItem onClick={() => handleNavigation('/charts')} sx={{ color: 'orange' }}>Charts</MenuItem>
            <MenuItem onClick={() => handleNavigation('/send-email')} sx={{ color: 'blue' }}>Send Email</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/send-email" element={<SendEmail />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/news-entry" element={<App />} />
        <Route path="/" element={<App />} />
        <Route path="/news-search" element={<NewsSearch />} />
      </Routes>
    </>
  );
};

export default MenuComponent;