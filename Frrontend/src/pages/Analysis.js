import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Biotech as BiotechIcon, // Icon for analyze button
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Assuming clearError is available if needed

const Analysis = () => {
  const [formData, setFormData] = useState({
    sender: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // Local error for this form
  const { user } = useAuth(); // Get user for potential user-specific actions or logging

  // Clear error when component mounts or user changes (if error was from a previous user's session)
  useEffect(() => {
    setError(null);
  }, [user]);

  const handleChange = (e) => {
    if (error) setError(null); // Clear error when user starts typing
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sender || !formData.subject || !formData.body) {
      setError('Please fill in all fields: Sender, Subject, and Body.');
      return;
    }
    
    setLoading(true);
    setError(null); // Clear previous errors
    setResult(null); // Clear previous results

    try {
      // IMPORTANT: Changed endpoint to /api/analyze-email
      const response = await axios.post('/api/analyze-email', {
        sender: formData.sender,
        subject: formData.subject,
        body: formData.body,
        // userEmail: user?.email // Optionally send user email for logging or context on backend
      });
      
      // Assuming the backend for /api/analyze-email will return a structure like:
      // { success: true, analysis: { isPhishing: true/false, indicators: [], score: 0.X, analyzedAt: आईएसओ_स्ट्रिंग } }
      // Or simply the direct analysis object if success is implied by 200 OK
      if (response.data) { // Check if response.data itself is the result or contains it
        // Adjust based on actual backend response structure for /api/analyze-email
        // For now, let's assume response.data is the direct analysis result object
        setResult(response.data); 
      } else {
        throw new Error('Analysis failed to return expected data.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred during analysis.');
      console.error("Analysis submission error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  // Updated renderResult to match a more generic analysis response
  const renderResult = () => {
    if (!result) return null;

    // Example: Adjusting to a hypothetical response from /api/analyze-email
    // const { isPhishing, indicators, score, analyzedAt, originalInput } = result;
    // For now, we'll try to adapt it to the existing structure as much as possible
    // but ideally, the backend for /api/analyze-email will send what this component expects
    // or this component will be updated to match the new backend.

    // Let's assume 'result' directly contains isPhishing, indicators, and an 'analyzedAt' timestamp.
    // And for sender/subject, we use what was submitted in formData as 'originalInput' might not exist yet.

    return (
      <Card sx={{ mt: 4, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analysis Report
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Status:
            </Typography>
            <Chip
              icon={result.isPhishing ? <WarningIcon /> : <CheckCircleIcon />}
              label={result.isPhishing ? 'Potential Phishing' : 'Likely Safe'}
              color={result.isPhishing ? 'error' : 'success'}
              sx={{ mr: 2, fontWeight: 'bold' }}
            />
            {result.analyzedAt && (
                <Typography variant="body2" color="text.secondary">
                    Analyzed on: {new Date(result.analyzedAt).toLocaleString()}
                </Typography>
            )}
          </Box>
          {result.score && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Confidence Score: { (result.score * 100).toFixed(2) }% 
              ({result.isPhishing ? 'phishing' : 'safe'})
            </Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Submitted Email Details:
          </Typography>
          <Box sx={{ pl: 2, mb:2, backgroundColor: '#f9f9f9', p:1, borderRadius:1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>From:</strong> {formData.sender} {/* Display submitted sender */}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Subject:</strong> {formData.subject} {/* Display submitted subject */}
            </Typography>
            <Typography variant="body2" component="pre" sx={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
              <strong>Body:</strong> {formData.body} {/* Display submitted body */}
            </Typography>
          </Box>
          
          {result.indicators && result.indicators.length > 0 ? (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2, color: result.isPhishing ? 'error.main' : 'warning.dark' }} gutterBottom>
                {result.isPhishing ? 'Key Phishing Indicators Detected:' : 'Potential Points of Interest:'}
              </Typography>
              <List dense>
                {result.indicators.map((indicator, index) => (
                  <ListItem key={index} sx={{py:0}}>
                    <ListItemText 
                      primary={typeof indicator === 'string' ? indicator : `${indicator.type}: ${indicator.detail}`}
                      primaryTypographyProps={{
                        color: result.isPhishing ? 'error.main' : 'text.secondary',
                        sx: { display: 'flex', alignItems: 'center' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Alert severity={result.isPhishing ? "warning" : "success"} sx={{ mt: 2 }}>
              {result.isPhishing ? 
                'Phishing detected, but specific textual indicators were not itemized by the model.' :
                'No specific adverse indicators were highlighted by the model.'
              }
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="md"> {/* Changed to md for more space for results */}
      <Box sx={{ mt: { xs: 4, sm: 8 }, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Analyze Email Content
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" sx={{mb: 3}}>
            Enter the details of the email you want to check for phishing.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Sender's Email Address"
              name="sender"
              value={formData.sender}
              onChange={handleChange}
              margin="normal"
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Email Subject Line"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Full Email Body / Content"
              name="body"
              value={formData.body}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={6} // Increased rows for more input space
              required
              placeholder="Paste the full email content here..."
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<BiotechIcon />}
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Analyze for Phishing'
              )}
            </Button>
          </form>
        </Paper>
        {renderResult()} {/* Results will be shown below the form */}
      </Box>
    </Container>
  );
};

export default Analysis;
