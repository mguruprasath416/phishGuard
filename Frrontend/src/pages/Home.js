import React from 'react';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Email as EmailIcon, Security as SecurityIcon } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h2" align="center" gutterBottom>
          Phishing Detection Tool
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Protect yourself from phishing attacks with our advanced email analysis tool
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'primary.light',
                  color: 'white',
                }}
                elevation={3}
              >
                <EmailIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Analyze Emails
                </Typography>
                <Typography align="center" paragraph>
                  Upload suspicious emails and get instant analysis of potential phishing threats
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/analyze')}
                >
                  Start Analysis
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'secondary.light',
                  color: 'white',
                }}
                elevation={3}
              >
                <SecurityIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  View History
                </Typography>
                <Typography align="center" paragraph>
                  Access your past email analysis results and track potential threats
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/history')}
                >
                  View History
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
