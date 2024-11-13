import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Paper, Container, Box } from '@mui/material';
import DataUpload from './DataUpload';

const Home = () => {
  const [user, setUser] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [details, setDetails] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/', { withCredentials: true })
      .then(response => {
        if (response.data.email) {
          setUser(response.data);
          setIsFirstTime(response.data.first_time || false);
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/update_details', { details }, { withCredentials: true })
      .then(response => {
        console.log(response.data.message);
        setIsFirstTime(false);
      })
      .catch(error => {
        console.error("Failed to update details:", error);
      });
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      {user ? (
        isFirstTime ? (
          <Paper sx={{ padding: 3, boxShadow: 3 }}>
            <Typography variant="h3" gutterBottom>
              Welcome, {user.name}! Please enter your details:
            </Typography>
            <form onSubmit={handleDetailsSubmit}>
              <TextField
                label="Details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Enter your details here"
                required
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ animation: 'fadeIn 1.5s ease-out' }}  // Use the theme animation for fadeIn
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ padding: '12px', fontWeight: 'bold', transition: 'background-color 0.3s ease, transform 0.2s ease' }}
              >
                Submit Details
              </Button>
            </form>
          </Paper>
        ) : (
          <div>
            <Typography variant="h3" gutterBottom>
              Welcome back, {user.name}
            </Typography>
            <DataUpload/>
          </div>
        )
      ) : (
        <Typography variant="h5">
          Redirecting to login...
        </Typography>
      )}
    </Container>
  );
};

export default Home;
