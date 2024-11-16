import React, { useState } from 'react';
import axios from 'axios';
import {
  Stepper, Step, StepLabel, Button, TextField, Box
} from '@mui/material';
import { keyframes } from '@mui/system';
import '../styles/styles.css'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';

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
  const [activeStep, setActiveStep] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ subject: 0, body: 0 });
  const navigate = useNavigate();
  const [sendTime, setSendTime] = useState("");
  const [sendOption, setSendOption] = useState('now');
  const steps = [
    'Upload CSV File',
    'Customize Email Prompt',
    'Generate Email Preview',
    'Schedule',
    'Send Email',
  ];

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

  // Track cursor position when the user interacts with the subject or body field
  const handleCursorChange = (e) => {
    const { name, selectionStart } = e.target;
    setCursorPosition((prev) => ({ ...prev, [name]: selectionStart }));
  };

  const addPlaceholder = (placeholder, field) => {
    setGeneratedEmail((prevEmail) => {
      const cursorPos = cursorPosition[field];
      const updatedField =
        prevEmail[field].slice(0, cursorPos) +
        `{${placeholder}}` +
        prevEmail[field].slice(cursorPos);
  
      return {
        ...prevEmail,
        [field]: updatedField,
      };
    });
  };

  const generateEmailPreview = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/gen-email', {
        prompt: customPrompt,
      });
      if (response.status === 200) {
        setGeneratedEmail((prevEmail) => ({
          subject: prevEmail.subject || response.data.subject,
          body: prevEmail.body || response.data.body,
        }));
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (error) {
      console.error('Error generating email preview:', error);
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNestStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleSendEmail = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/send-email', {
        emailContent: generatedEmail,
        sendTime,
      });
      if (response.status === 200) {
        handleComplete()
        console.log('Email sent successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSendOptionChange = (event) => {
    setSendOption(event.target.value);

    // If "Send Now" is selected, set the time to "0"
    if (event.target.value === 'now') {
      setSendTime('0');
    }
  };

  const handleComplete = () => {
    console.log('Process complete!');
    navigate('/profile');
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
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="stepperContainer"
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '50px',
            borderRadius: '8px',
            flexGrow: 1,
            overflowY: 'auto',
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{label}</StepLabel>
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
                <h3>Step 2: Email Prompt</h3>
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

            {activeStep === 2 && (
                  <div>
                    <h4>Subject</h4>
            {columns.map((col) => (
            <Button
              key={col}
              onClick={() => addPlaceholder(col, 'subject')}
              className="button"
            >
              {col}
            </Button>
          ))}
          <TextField
            name="subject"
            value={generatedEmail.subject}
            onChange={(e) =>
              setGeneratedEmail((prev) => ({ ...prev, subject: e.target.value }))
            }
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            multiline
            rows={2}
            fullWidth
            className="textField"
          />
          <h4>Body</h4>
          {columns.map((col) => (
            <Button
              key={col}
              onClick={() => addPlaceholder(col, 'body')}
              className="button"
            >
              {col}
            </Button>
          ))}
          <TextField
            name="body"
            value={generatedEmail.body}
            onChange={(e) =>
              setGeneratedEmail((prev) => ({ ...prev, body: e.target.value }))
            }
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            multiline
            rows={7}
            fullWidth
            className="textField"
          />
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button onClick={handlePrevStep} className="button">
              Previous
            </Button>
            <Button onClick={generateEmailPreview} className="button">
              Schedule the email
            </Button>
          </div>
                  </div>
            )}

      {activeStep === 3 && (
        <div>
          <h3>Step 4: Schedule the emails</h3>

          {/* Radio buttons to choose send option */}
          <FormControl component="fieldset">
            <FormLabel component="legend">Select Send Option</FormLabel>
            <RadioGroup value={sendOption} onChange={handleSendOptionChange}>
              <FormControlLabel value="now" control={<Radio />} label="Send Now" />
              <FormControlLabel value="custom" control={<Radio />} label="Set Custom Time" />
            </RadioGroup>
          </FormControl>

          {/* Custom time input */}
          {sendOption === 'custom' && (
            <>
              <TextField
                label="Schedule Time (YYYY-MM-DDTHH:MM:SS)"
                fullWidth
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                style={{ marginBottom: '20px' }}
              />
              </>
          )}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <Button onClick={handleNestStep} type="submit" className="button">
                            Set the time
                          </Button>
                        </div>
        </div>
      )}

            {activeStep === 4 && (
              <div>
                <h3>Step 5: Send Email</h3>
                <p><strong>Subject:</strong> {generatedEmail.subject}</p>
                <p><strong>Body:</strong></p>
                <div style={{ whiteSpace: 'pre-line' }}>{generatedEmail.body}</div>
                <p>Are you sure you want to send this email to all addresses in the CSV?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <Button onClick={handlePrevStep} className="button">Edit email</Button>
                  <Button onClick={handleSendEmail} className="button">Send Email</Button>
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
