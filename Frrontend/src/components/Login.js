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
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import Link as RouterLink for internal navigation

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Destructure clearError from useAuth
    const { login, loading, error, clearError, isAuthenticated } = useAuth(); 
    const navigate = useNavigate();

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated) {
            navigate('/');
        }
        // Clear any existing errors when the component mounts or when auth state changes
        if (error) {
          clearError();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, navigate]); // Rerun if isAuthenticated changes

    // Separate useEffect for clearing error on initial mount or if error changes from elsewhere
    useEffect(() => {
        return () => {
            if (error) {
                clearError(); // Clear errors when component unmounts if an error was shown
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]); // Only re-run if error state itself changes


    const handleEmailChange = (e) => {
        if (error) clearError(); // Clear error when user starts typing
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        if (error) clearError(); // Clear error when user starts typing
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) clearError(); // Clear previous error before new attempt
        const success = await login(email, password);
        if (success) {
            navigate('/'); // Navigate to home on successful login
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" gutterBottom align="center">
                        Login
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => clearError()}> {/* Allow dismissing error */}
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={handleEmailChange} // Use new handler
                            margin="normal"
                            required
                            autoFocus // Focus on email field initially
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange} // Use new handler
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
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            {/* Use RouterLink for internal navigation to avoid full page reload */}
                            <Link component={RouterLink} to="/register" variant="body2">
                                Don't have an account? Register
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
