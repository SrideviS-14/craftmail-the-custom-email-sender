import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppBar, Toolbar, Button, Typography, Container, IconButton } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import Home from './components/Home';
import Login from './components/Login';
import DataUpload from './components/DataUpload';
import About from './components/About';
import Contact from './components/Contact';
import Profile from './components/Profile';  // Import Profile component
import { useNavigate } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#fff' }}>
          CraftMail
        </Typography>
        <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
        <Button color="inherit" onClick={() => navigate('/about')}>About</Button>
        <Button color="inherit" onClick={() => navigate('/contact')}>Contact</Button>

        {/* Profile Icon */}
        { isLoggedIn==='true' &&
        <IconButton color="inherit" onClick={handleProfileClick}>
          <AccountCircleIcon />
        </IconButton>
}
      </Toolbar>
    </AppBar>
    <br/><br/>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <NavigationBar />
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dataupload" element={<DataUpload />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />  {/* Add route for Profile page */}
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;
