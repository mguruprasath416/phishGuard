import React, { useState, useEffect } from 'react'; // Added useEffect
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Link
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import Link as RouterLink

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Destructure clearError and isAuthenticated from useAuth
    const { register, loading, error, clearError, isAuthenticated } = useAuth(); 
    const navigate = useNavigate();
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated) {
            navigate('/');
        }
        // Clear any existing API errors when the component mounts
        if (error) {
          clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, navigate]); // Rerun if isAuthenticated changes

    // Effect to clear API error when component unmounts if one was shown
    useEffect(() => {
        return () => {
            if (error) {
                clearError();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    const handleEmailChange = (e) => {
        if (error) clearError(); // Clear API error
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        if (error) clearError(); // Clear API error
        if (validationError) setValidationError(''); // Clear local validation error
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e) => {
        if (error) clearError(); // Clear API error
        if (validationError) setValidationError(''); // Clear local validation error
        setConfirmPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) clearError(); // Clear previous API error
        setValidationError(''); // Clear previous validation error
        
        if (password !== confirmPassword) {
            setValidationError('Passwords do not match. Please try again.');
            return;
        }
        if (password.length < 6) {
            setValidationError('Password must be at least 6 characters long.');
            return;
        }

        const success = await register(email, password);
        if (success) {
            // Optionally, show a success message before navigating
            // alert('Registration successful! Please login.'); 
            navigate('/login'); // Navigate to login page after successful registration
        }
    };

    // Determine which error to display
    const displayError = validationError || error;

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Create Account
                    </Typography>
                    {displayError && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 2 }} 
                            onClose={() => {
                                if (validationError) setValidationError('');
                                if (error) clearError();
                            }}
                        >
                            {displayError}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            margin="normal"
                            required
                            autoFocus
                        />
                        <TextField
                            fullWidth
                            label="Password (min. 6 characters)"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            margin="normal"
                            required
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link component={RouterLink} to="/login" variant="body2">
                                Already have an account? Login
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
