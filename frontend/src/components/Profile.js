import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';
import axios from 'axios';  // Make sure axios is installed
import EmailStatusDashboard from './EmailStatusDashboard';

const Profile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // Current page state
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page state

  useEffect(() => {
    // Fetch user details and email history from the backend
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user-details'); // Call your backend endpoint
        setUserDetails(response.data);  // Store the user details and email history
        setLoading(false);
      } catch (err) {
        setError('Failed to load user details');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Handle change in pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page to 0 when rows per page change
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress /> {/* Show loading spinner */}
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert> {/* Show error message */}
      </Container>
    );
  }

  // Paginate email history
  const paginatedEmailHistory = userDetails?.email_history.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          PROFILE
        </Typography>
        {userDetails ? (
          <>
            <Typography variant="h6">
              Name: {userDetails.user.name}
            </Typography>
            <Typography variant="h6">
              Email: {userDetails.user.email}
            </Typography>
            <EmailStatusDashboard/>
            {/* Display Email History */}
            <Typography variant="h6" gutterBottom>
              Email History:
            </Typography>
            <TableContainer component={Paper}>
              <Table aria-label="email history table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ backgroundColor: '#9c27b0', color: 'white' }}>Recipient</TableCell>
                    <TableCell sx={{ backgroundColor: '#9c27b0', color: 'white' }}>Subject</TableCell>
                    <TableCell sx={{ backgroundColor: '#9c27b0', color: 'white' }}>Sent At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmailHistory.map((email, index) => (
                    <TableRow key={index}>
                      <TableCell>{email.recipient_email}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>{new Date(email.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={userDetails.email_history.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Typography variant="body1">No user details available</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;
