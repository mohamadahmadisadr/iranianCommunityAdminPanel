import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  Warning,
  CheckCircle,
  Refresh,
  SignalWifiStatusbar4Bar,
  SignalWifiStatusbarConnectedNoInternet4,
} from '@mui/icons-material';
import { isOnline, addNetworkListeners, checkFirebaseConnection } from '../../utils/firebaseRetry';
import toast from 'react-hot-toast';

const ConnectionIndicator = () => {
  const [isConnected, setIsConnected] = useState(isOnline());
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Initial connection check
    checkConnections();

    // Set up network listeners
    const removeListeners = addNetworkListeners(
      () => {
        setIsConnected(true);
        toast.success('Internet connection restored');
        checkFirebaseConnection();
      },
      () => {
        setIsConnected(false);
        setFirebaseConnected(false);
        toast.error('Internet connection lost');
      }
    );

    // Periodic Firebase connection check
    const interval = setInterval(() => {
      if (isOnline()) {
        checkFirebaseConnection();
      }
    }, 60000); // Check every minute

    return () => {
      removeListeners();
      clearInterval(interval);
    };
  }, []);

  const checkConnections = async () => {
    const networkStatus = isOnline();
    setIsConnected(networkStatus);

    if (networkStatus) {
      const firebaseStatus = await checkFirebaseConnection();
      setFirebaseConnected(firebaseStatus);
    } else {
      setFirebaseConnected(false);
    }
    
    setLastChecked(new Date());
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await checkConnections();
      toast.success('Connection status updated');
    } catch (error) {
      toast.error('Failed to check connection');
    } finally {
      setChecking(false);
    }
    handleClose();
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: WifiOff,
        color: 'error',
        status: 'Offline',
        description: 'No internet connection',
      };
    }
    
    if (!firebaseConnected) {
      return {
        icon: SignalWifiStatusbarConnectedNoInternet4,
        color: 'warning',
        status: 'Limited',
        description: 'Internet connected, but having trouble reaching our servers',
      };
    }
    
    return {
      icon: SignalWifiStatusbar4Bar,
      color: 'success',
      status: 'Connected',
      description: 'All systems operational',
    };
  };

  const connectionStatus = getConnectionStatus();
  const IconComponent = connectionStatus.icon;
  const showBadge = !isConnected || !firebaseConnected;

  return (
    <>
      <Tooltip title={`Connection: ${connectionStatus.status}`}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ 
            ml: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Badge
            variant="dot"
            color={connectionStatus.color}
            invisible={!showBadge}
            sx={{
              '& .MuiBadge-badge': {
                right: 6,
                top: 6,
              },
            }}
          >
            <IconComponent 
              sx={{ 
                color: showBadge 
                  ? connectionStatus.color === 'error' 
                    ? 'error.main' 
                    : 'warning.main'
                  : 'inherit',
              }} 
            />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 280,
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Connection Status Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <IconComponent color={connectionStatus.color} />
            <Typography variant="subtitle1" fontWeight="medium">
              {connectionStatus.status}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {connectionStatus.description}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last checked: {lastChecked.toLocaleTimeString()}
          </Typography>
        </Box>

        <Divider />

        {/* Connection Details */}
        <Box sx={{ p: 2, py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2">Internet</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isConnected ? (
                <CheckCircle color="success" fontSize="small" />
              ) : (
                <WifiOff color="error" fontSize="small" />
              )}
              <Typography variant="body2" color={isConnected ? 'success.main' : 'error.main'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">Database</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {firebaseConnected ? (
                <CheckCircle color="success" fontSize="small" />
              ) : (
                <Warning color="warning" fontSize="small" />
              )}
              <Typography 
                variant="body2" 
                color={firebaseConnected ? 'success.main' : 'warning.main'}
              >
                {firebaseConnected ? 'Connected' : 'Issues'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Box sx={{ p: 1 }}>
          <MenuItem onClick={handleRefresh} disabled={checking}>
            <Refresh sx={{ mr: 1 }} />
            {checking ? 'Checking...' : 'Check Connection'}
          </MenuItem>
          
          {(!isConnected || !firebaseConnected) && (
            <MenuItem onClick={handleRefreshPage}>
              <Refresh sx={{ mr: 1 }} />
              Refresh Page
            </MenuItem>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default ConnectionIndicator;
