import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './index.css';

interface MenuComponentProps {
  setCurrentScreen: (screen: string) => void;
}

const MenuComponent: React.FC<MenuComponentProps> = ({ setCurrentScreen }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleHelloWorldClick = () => {
    setCurrentScreen('helloWorld');
    handleClose();
  };

  const handleFormClick = () => {
    setCurrentScreen('form');
    handleClose();
  };

  return (
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
          <MenuItem onClick={handleFormClick} sx={{ color: 'red' }}>Form</MenuItem>
          <MenuItem onClick={handleHelloWorldClick} sx={{ color: 'orange' }}>Hello World</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default MenuComponent;