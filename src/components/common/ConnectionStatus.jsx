import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Snackbar,
  IconButton,
  Typography,
  Chip,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  Refresh,
  Close,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { isOnline, addNetworkListeners, checkFirebaseConnection } from '../../utils/firebaseRetry';
import toast from 'react-hot-toast';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(isOnline());
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showFirebaseAlert, setShowFirebaseAlert] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Initial connection check
    checkConnections();

    // Set up network listeners
    const removeListeners = addNetworkListeners(
      () => {
        setIsConnected(true);
        setShowOfflineAlert(false);
        toast.success('Internet connection restored');
        checkFirebaseConnection();
      },
      () => {
        setIsConnected(false);
        setShowOfflineAlert(true);
        toast.error('Internet connection lost');
      }
    );

    // Periodic Firebase connection check
    const interval = setInterval(checkFirebaseConnection, 30000); // Check every 30 seconds

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
      setShowFirebaseAlert(!firebaseStatus);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await checkConnections();
      if (firebaseConnected) {
        toast.success('Connection restored successfully');
        setShowFirebaseAlert(false);
      }
    } catch (error) {
      toast.error('Still having connection issues. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  return (
    <>
      {/* Network Status Indicator - Only show when offline or having issues */}
      {(!isConnected || showFirebaseAlert) && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1300, // Below modal/dialog z-index but above content
          }}
        >
          <Chip
            icon={isConnected ? <Warning /> : <WifiOff />}
            label={
              !isConnected
                ? 'Offline'
                : showFirebaseAlert
                ? 'Connection Issues'
                : 'Online'
            }
            color={!isConnected ? 'error' : showFirebaseAlert ? 'warning' : 'success'}
            variant="filled"
            size="small"
            sx={{
              boxShadow: 2,
              '& .MuiChip-label': {
                fontWeight: 'medium',
              },
            }}
          />
        </Box>
      )}

      {/* Offline Alert */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="error"
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setShowOfflineAlert(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <AlertTitle>No Internet Connection</AlertTitle>
          Please check your internet connection and try again.
        </Alert>
      </Snackbar>

      {/* Firebase Connection Alert */}
      <Snackbar
        open={showFirebaseAlert && isConnected}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ mb: 2, mr: 2 }}
      >
        <Alert
          severity="warning"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                disabled={retrying}
                startIcon={<Refresh />}
              >
                {retrying ? 'Retrying...' : 'Try Again'}
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleRefreshPage}
                startIcon={<Refresh />}
              >
                Refresh
              </Button>
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setShowFirebaseAlert(false)}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle>Connection Issue</AlertTitle>
          Having trouble connecting to our servers. Some features may not work properly.
        </Alert>
      </Snackbar>
    </>
  );
};

export default ConnectionStatus;
