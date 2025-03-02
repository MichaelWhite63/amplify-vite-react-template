import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Menu, 
  MenuItem 
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';

const NewsAppBar: React.FC = () => {
  const navigate = useNavigate();
  const [newsAnchorEl, setNewsAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);
  const [deliveryAnchorEl, setDeliveryAnchorEl] = useState<null | HTMLElement>(null);
  const newsOpen = Boolean(newsAnchorEl);
  const userOpen = Boolean(userAnchorEl);
  const deliveryOpen = Boolean(deliveryAnchorEl);

  const handleNewsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNewsAnchorEl(event.currentTarget);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleDeliveryClick = (event: React.MouseEvent<HTMLElement>) => {
    setDeliveryAnchorEl(event.currentTarget);
  };

  const handleNewsClose = () => {
    setNewsAnchorEl(null);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleDeliveryClose = () => {
    setDeliveryAnchorEl(null);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    handleNewsClose();
    handleUserClose();
    handleDeliveryClose();
  };

  return (
    <>
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        margin: 0,
        padding: 0,
        backgroundColor: '#191970',
        height: '65px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100
      }}>
        <div style={{ width: '950px', margin: '0 auto' }}>
          <img 
            src={logoUrl} 
            alt="Metal News Logo" 
            style={{ 
              display: 'block',
              backgroundColor: 'white',
              height: '63px'
            }} 
          />
        </div>
      </div>
      <AppBar 
        position="fixed" 
        sx={{ 
          top: '65px',
          backgroundColor: '#191970'
        }}
      >
        <Toolbar sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', // Changed from center to space-between
          width: '100%', // Ensure toolbar takes full width
          maxWidth: '1200px', // Optional: limit maximum width
          margin: '0 auto', // Center the toolbar content
          padding: '0 24px' // Add some padding on the sides
        }}>
          {/* News Menu - Left */}
          <Box>
            <Button
              color="inherit"
              onClick={handleNewsClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              ニュース
            </Button>
            <Menu
              anchorEl={newsAnchorEl}
              open={newsOpen}
              onClose={handleNewsClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <MenuItem 
                onClick={() => handleMenuItemClick('/news-entry')}
                sx={{ 
                  minWidth: '200px',
                  color: 'white'
                }}
              >
                ニュースの作成
              </MenuItem>
              <MenuItem 
                onClick={() => handleMenuItemClick('/news-search')}
                sx={{ 
                  minWidth: '200px',
                  color: 'white'
                }}
              >
                ニュースの検索
              </MenuItem>
              <MenuItem 
                onClick={() => handleMenuItemClick('/charts')}
                sx={{ 
                  minWidth: '200px',
                  color: 'white'
                }}
              >
                チャートの編集
              </MenuItem>
            </Menu>
          </Box>

          {/* User Menu - Center */}
          <Box>
            <Button
              color="inherit"
              onClick={handleUserClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              ユーザー
            </Button>
            <Menu
              anchorEl={userAnchorEl}
              open={userOpen}
              onClose={handleUserClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <MenuItem 
                onClick={() => handleMenuItemClick('/create-user')}
                sx={{ 
                  minWidth: '200px',
                  color: 'white'
                }}
              >
                ユーザーの作成
              </MenuItem>
              <MenuItem 
                onClick={() => handleMenuItemClick('/update-users')}
                sx={{ 
                  minWidth: '200px',
                  color: 'white'
                }}
              >
                ユーザーの検索
              </MenuItem>
            </Menu>
          </Box>

          {/* Delivery Menu - Right */}
          <Box>
            <Button
              color="inherit"
              onClick={handleDeliveryClick}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                }
              }}
            >
              配信
            </Button>
            <Menu
              anchorEl={deliveryAnchorEl}
              open={deliveryOpen}
              onClose={handleDeliveryClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <MenuItem 
                onClick={() => handleMenuItemClick('/send-email')}
                sx={{ 
                  minWidth: '200px',
                  color: 'white'
                }}
              >
                ニュースの配信をする
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NewsAppBar;