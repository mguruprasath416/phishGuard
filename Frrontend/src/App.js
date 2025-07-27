import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material'; // ThemeProvider and createTheme removed
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';

// Pages
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import History from './pages/History';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Ensure useAuth is called within AuthProvider context. 
  // If AuthProvider is not high enough in the tree, this might cause issues.
  // However, given the structure, AuthProvider wraps Router, so this should be fine.
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Theme creation is removed from App.js, assuming it's handled in index.js

function App() {
  return (
    // ThemeProvider removed from here
    <AuthProvider>
      <CssBaseline /> {/* CssBaseline can remain or be in index.js, ensure it's applied once after ThemeProvider */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          {/* Consider adding a catch-all 404 route here */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
    // ThemeProvider removed from here
  );
}

export default App;
