import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const AuthLoader = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          color: 'text.secondary',
          fontWeight: 'medium',
        }}
      >
        Loading...
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: 'text.secondary',
          textAlign: 'center',
        }}
      >
        Checking authentication status
      </Typography>
    </Box>
  );
};

export default AuthLoader;
