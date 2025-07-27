import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar, // For user icon/avatar
  Tooltip // For hover text on user email/avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon, // Default user icon
  Analytics as AnalyticsIcon, // Icon for Analyze
  History as HistoryIcon, // Icon for History
  Home as HomeIcon // Icon for Home
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import Link as RouterLink
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [anchorElUser, setAnchorElUser] = React.useState(null); // For user menu on desktop
  const [anchorElNav, setAnchorElNav] = React.useState(null); // For nav menu on mobile
  const { isAuthenticated, user, logout } = useAuth(); // Destructure user
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Adjusted breakpoint for better responsiveness

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleCloseUserMenu();
    handleCloseNavMenu();
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Analyze', path: '/analyze', icon: <AnalyticsIcon /> },
    { label: 'History', path: '/history', icon: <HistoryIcon /> },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <SecurityIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant={isMobile ? 'subtitle1' : 'h6'}
            noWrap
            component={RouterLink} // Use RouterLink
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              flexGrow: isMobile ? 1 : 0, // Allow title to grow on mobile if no user menu
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PhishGuard
          </Typography>

          {/* Mobile Menu Icon */}
          {isAuthenticated && isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
              <IconButton
                size="large"
                aria-label="navigation menu"
                aria-controls="menu-appbar-nav"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar-nav"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {navItems.map((item) => (
                  <MenuItem key={item.label} onClick={handleCloseNavMenu} component={RouterLink} to={item.path}>
                    {item.icon && <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>}
                    <Typography textAlign="center">{item.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
          
          {/* PhishGuard title for mobile (when menu icon is present) - centered or to the left of menu */}
          <SecurityIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
           <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PhishGuard
          </Typography>

          {/* Desktop Navigation Links */}
          {isAuthenticated && !isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  component={RouterLink} // Use RouterLink
                  to={item.path}
                  onClick={handleCloseNavMenu} // Though not strictly needed for desktop, good for consistency if menu structure changes
                  sx={{ my: 2, color: 'white', display: 'block' }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Auth Links / User Menu */}
          {isAuthenticated ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={user?.email || 'User Account'}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user?.email?.toUpperCase()} src="/static/images/avatar/2.jpg"> {/* Fallback to first letter if no image */}
                    {user?.email ? user.email.charAt(0).toUpperCase() : <AccountCircleIcon />}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar-user"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  <Typography textAlign="center" variant="caption">{user?.email}</Typography>
                </MenuItem>
                {/* Add other user-specific menu items here e.g. Profile */} 
                <MenuItem onClick={handleLogout} >
                  <LogoutIcon sx={{ mr: 1 }} />
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0, display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
              <Button component={RouterLink} to="/register" color="inherit">
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
