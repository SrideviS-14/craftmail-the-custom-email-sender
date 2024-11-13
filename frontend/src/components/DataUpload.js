import React, { useState } from 'react';
import axios from 'axios';
import {
  Stepper, Step, StepLabel, Button, Typography, TextField, Box, Dialog,
  DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import EmailStatusDashboard from './EmailStatusDashboard';
import { borderRadius, keyframes } from '@mui/system';
import '../styles/styles.css'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
// Animation for step transitions
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

function DataUpload() {
  const [file, setFile] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [columns, setColumns] = useState([]);
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: '',
    body: '',
  });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedEmail, setEditedEmail] = useState({
    subject: generatedEmail.subject,
    body: generatedEmail.body,
  });

  const steps = [
    'Upload CSV File',
    'Customize Email Prompt',
    'Generate Email Preview',
    'Send Email',
    'Email Status Dashboard',
  ];
  const navigate = useNavigate();
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setColumns(response.data.columns || []);
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const addPlaceholder = (placeholder) => {
    setCustomPrompt((prevPrompt) => `${prevPrompt} {${placeholder}}`);
  };

  const generateEmailPreview = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/gen-email', {
        prompt: customPrompt,
      });
      if (response.status === 200) {
        const dict = {
          subject: response.data.subject,
          body: response.data.body,
        };
        setGeneratedEmail(dict);
        setEditedEmail(dict);
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (error) {
      console.error('Error generating email preview:', error);
    }
  };

  const handleConfirmEmail = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleSendEmail = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/send-email', {
        emailContent: generatedEmail,
      });
      if (response.status === 200) {
        setIsEmailSent(true);
        setActiveStep((prevStep) => prevStep + 1);
        console.log('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleOpenEditDialog = () => {
    setEditedEmail({
      subject: generatedEmail.subject,
      body: generatedEmail.body,
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveChanges = () => {
    setGeneratedEmail({ ...editedEmail });
    setIsEditDialogOpen(false);
  };

  const handlePrevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleComplete = () => {
    console.log('Process complete!');
    // Add your completion logic here (e.g., redirect, display a success message)
    navigate('/profile')
  };

  return (
    <div>
      <h2>Send your emails just in a snap!</h2>
      <Box
        sx={{
          backgroundColor: '#9c27b0',
          padding: '50px',
          borderRadius: '10px',
          marginBottom: '20px',
          marginTop: '20px',
          animation: `${fadeIn} 1s ease-out`,
          width: '800px',
          minHeight: '400px',  // Minimum height to ensure it doesn't shrink too much
          display: 'flex',       // This will allow the content to grow flexibly
          flexDirection: 'column', // Stack the elements vertically
        }}
        className="stepperContainer"
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '50px',
            borderRadius: '8px',
            flexGrow: 1, // Ensures this div takes all available space
            overflowY: 'auto', // Prevents overflow if content grows too much
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    fontSize: '5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <div>
            {activeStep === 0 && (
              <div>
                <h3>Step 1: Upload CSV File</h3>
                <form onSubmit={handleFileUpload}>
                  <input type="file" onChange={handleFileChange} accept=".csv" className="textField" style={{ borderRadius:'8px', border: '1px solid #ccc'}}/>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <Button type="submit" className="button">Upload</Button>
                  </div>
                </form>
              </div>
            )}

            {activeStep === 1 && columns.length > 0 && (
              <div>
                <h3>Step 2: Customize Email Prompt</h3>
                <div>
                  <h4>Available Placeholders</h4>
                  {columns.map((col) => (
                    <Button key={col} onClick={() => addPlaceholder(col)} className="button">
                      {col}
                    </Button>
                  ))}
                  <br/><br/>
                </div>
                <TextField
                  label="Custom Prompt"
                  multiline
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  fullWidth
                  className="textField"
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button onClick={handlePrevStep} className="button">Previous</Button>
                  <Button onClick={generateEmailPreview} className="button">Generate Preview</Button>
                </div>
              </div>
            )}

            {activeStep === 2 && generatedEmail.subject && generatedEmail.body && (
              <div>
                <h3>Step 3: Preview Email</h3>
                <h4>Subject</h4>
                <p>{generatedEmail.subject}</p>
                <h4>Body</h4>
                <p>{generatedEmail.body}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button onClick={handlePrevStep} className="button">Previous</Button>
                  <Button onClick={handleOpenEditDialog} className="button">Edit Email</Button>
                  <Button onClick={handleConfirmEmail} className="button">Confirm</Button>
                  <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
                  <DialogTitle>Edit Email</DialogTitle>
                  <br/>
                  <DialogContent className="dialogContent">
                    <TextField
                      label="Subject"
                      value={editedEmail.subject}
                      onChange={(e) => setEditedEmail({ ...editedEmail, subject: e.target.value })}
                      fullWidth
                      className="textField"
                    />
                    <TextField
                      label="Body"
                      multiline
                      rows={7}
                      value={editedEmail.body}
                      onChange={(e) => setEditedEmail({ ...editedEmail, body: e.target.value })}
                      fullWidth
                      className="textField"
                    />
                  </DialogContent>
                  <DialogActions className="dialogActions">
                    <Button onClick={handleCloseEditDialog} className="button">Cancel</Button>
                    <Button onClick={handleSaveChanges} className="button dialogButton">Save Changes</Button>
                  </DialogActions>
                </Dialog>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div>
                <h3>Step 4: Send Email</h3>
                Are you sure you want to send this email to all the email address in the csv ? 
                <br/>
                If yes click "send email"
                <br/><br/><br/>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button onClick={handlePrevStep} className="button">Edit email</Button>
                  <Button onClick={handleSendEmail} className="button">Send Email</Button>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div>
                <EmailStatusDashboard />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button onClick={handleComplete} className="button">Complete!</Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </Box>
    </div>
  );
}

export default DataUpload;
