// src/components/About.js
import React from 'react';
import { Container, Typography } from '@mui/material';

const About = () => (
  <Container maxWidth="sm">
    <Typography variant="h3" gutterBottom>About Us</Typography>
    <Typography variant="body1">
      CraftMail is an innovative platform that helps users manage their emails efficiently and effectively.
      Our mission is to make email management easier for everyone.
    </Typography>
  </Container>
);

export default About;
