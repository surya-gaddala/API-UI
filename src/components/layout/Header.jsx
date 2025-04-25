import React from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, InputBase, Button, Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <IconButton size="small" edge="start" sx={{ mr: 1 }}>
          <MenuIcon />
        </IconButton>
        <IconButton size="small" sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <IconButton size="small" sx={{ mr: 2 }}>
          <ArrowForwardIcon />
        </IconButton>
        <Typography variant="body1" sx={{ mr: 2 }}>Home</Typography>
        <Typography variant="body1" sx={{ mr: 2 }}>Workspaces</Typography>
        <Typography variant="body1" sx={{ mr: 2 }}>API Network</Typography>
        <Box sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          px: 2,
          mx: 2,
        }}>
          <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <InputBase
            placeholder="Search"
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mr: 1 }}
        >
          Invite
        </Button>
        <IconButton size="small">
          <SettingsIcon />
        </IconButton>
        <IconButton size="small">
          <NotificationsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 