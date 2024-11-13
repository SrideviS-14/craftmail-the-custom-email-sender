// src/components/Contact.js
import React from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';

const Contact = () => (
  <Container maxWidth="sm">
    <Typography variant="h3" gutterBottom>Contact Us</Typography>
    <Typography variant="body1" paragraph>
      Reach out to us with any questions or feedback. We would love to hear from you!
    </Typography>
    <form>
      <TextField
        label="Your Email"
        type="email"
        fullWidth
        required
        margin="normal"
      />
      <TextField
        label="Message"
        multiline
        rows={4}
        fullWidth
        required
        margin="normal"
      />
      <Button variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </form>
  </Container>
);

export default Contact;
