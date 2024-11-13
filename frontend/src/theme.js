import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#9c27b0', // Purple color for primary actions
    },
    secondary: {
      main: '#e91e63', // Pinkish accent color for secondary actions
    },
    background: {
      default: '#f3f4f6', // Light background color
    },
    text: {
      primary: '#333', // Dark text for better contrast
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px', // Rounded corners for buttons
          padding: '10px 20px',
          textTransform: 'none', // Preserve text case
          fontWeight: '500',
          transition: 'background-color 0.3s ease, transform 0.2s ease', // Add transition effect
          '&:hover': {
            transform: 'scale(1.05)', // Slight scale effect on hover
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 'bold',
          color: '#9c27b0',
          animation: 'fadeIn 1s ease-out', // Animation for StepLabel
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '20px',
          animation: 'fadeIn 1.5s ease-out', // Add fade-in effect to TextField
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          padding: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          animation: 'scaleUp 0.5s ease-out', // Dialog scale animation
        },
      },
    },
  },
  // Add keyframes for animations
  overrides: {
    '@keyframes fadeIn': {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
    '@keyframes scaleUp': {
      '0%': { transform: 'scale(0.95)' },
      '100%': { transform: 'scale(1)' },
    },
  },
  // Center-alignment for form components
  shape: {
    borderRadius: 8,
  },
});
