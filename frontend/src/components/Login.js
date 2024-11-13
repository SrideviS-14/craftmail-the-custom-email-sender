// src/Login.js
import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';

const Login = () => {
  
  const handleLogin = () => {
    // Redirect to Flask login route
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = "http://localhost:5000/login";
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        backgroundColor: 'background.default',
        flexDirection: 'column',
        textAlign: 'center',
        padding: 3,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '400px',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          padding: 4,
          backgroundColor: 'white',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: '2rem',
            marginBottom: 4,
            color: 'primary.main',
          }}
        >
          Login
        </Typography>
        <Button
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            padding: '8px 32px',
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            transition: 'background-color 0.3s ease',
          }}
          onClick={handleLogin}
          fullWidth
        >
          Login with Google
        </Button>
      </Box>
    </Container>
  );
};

export default Login;