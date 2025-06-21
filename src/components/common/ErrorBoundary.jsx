import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stack,
} from '@mui/material';
import {
  Refresh,
  Error as ErrorIcon,
  Home,
  Settings,
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
    
    // Force a re-render by updating the key prop
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRefreshPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isFirebaseError = this.state.error?.message?.includes('firestore') || 
                             this.state.error?.message?.includes('Firebase') ||
                             this.state.error?.code?.includes('firestore');

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Oops! Something went wrong
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {isFirebaseError 
                    ? "We're having trouble connecting to our servers. This might be a temporary network issue."
                    : "An unexpected error occurred. Don't worry, our team has been notified."
                  }
                </Typography>
              </Box>

              {isFirebaseError && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <AlertTitle>Connection Issue Detected</AlertTitle>
                  This appears to be a Firebase/Firestore connectivity issue. Please check your internet connection and try again.
                </Alert>
              )}

              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  size="large"
                  fullWidth
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={this.handleRefreshPage}
                  size="large"
                  fullWidth
                >
                  Refresh Page
                </Button>

                <Button
                  variant="text"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  size="large"
                  fullWidth
                >
                  Go to Dashboard
                </Button>
              </Stack>

              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Debug Information (Development Only)
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ 
                    fontSize: '0.75rem', 
                    overflow: 'auto',
                    maxHeight: 200,
                  }}>
                    {this.state.error ? 
                      (typeof this.state.error === 'object' ? 
                        JSON.stringify(this.state.error, null, 2) : 
                        this.state.error.toString()
                      ) : 'No error message available'
                    }
                    {'\n\n'}
                    {this.state.errorInfo ? 
                      (typeof this.state.errorInfo === 'object' ?
                        JSON.stringify(this.state.errorInfo, null, 2) :
                        this.state.errorInfo.toString()
                      ) : 'No component stack available'
                    }
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Retry count: {this.state.retryCount}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
