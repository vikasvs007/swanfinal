import { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  useTheme, 
  Paper, 
  InputAdornment, 
  IconButton, 
  Divider, 
  Avatar, 
  Grid,
  useMediaQuery,
  Fade,
  Zoom,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "state";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LoginIcon from "@mui/icons-material/Login";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import GoogleIcon from '@mui/icons-material/Google';
import { auth, googleProvider } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

// Security through obscurity - this is NOT a secure approach for real applications
// In a real app, authentication should be handled server-side
const getUserData = (type) => {
  // Return mock user data based on user type
  const users = {
    admin: {
      id: "67ab741b4ed113b4940fac28",
      email: "admin@company.com",
      password: "admin@123",
      name: "Admin User",
      role: "admin"
    }
  };
  
  return users[type];
};

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formValues, setFormValues] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fade in animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowForm(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
    
    // Clear login error when user types
    if (loginError) {
      setLoginError("");
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };
    
    // Email validation
    if (!formValues.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }
    
    // Password validation
    if (!formValues.password) {
      newErrors.password = "Password is required";
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  // Function to safely prefill demo credentials without exposing them
  const fillDemoCredentials = (userType) => {
    const userData = getUserData(userType);
    setFormValues({
      email: userData.email,
      password: userData.password
    });
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Set user in Redux store
      dispatch(setUser({
        id: user.uid,
        email: user.email,
        name: user.displayName || 'Google User',
        role: 'admin' // Default role for Google users
      }));
      
      // Generate a token and set it in Redux
      const token = await user.getIdToken();
      dispatch(setToken(token));
      
      // Store authentication in localStorage (for persistence)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authToken', token);
      
      console.log("Google login successful! Redirecting...");
      
      // Get the URL from the search params (if it exists)
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirectTo');
      
      // Redirect to the originally requested URL or dashboard
      if (redirectTo && redirectTo.startsWith('/')) {
        navigate(redirectTo);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setLoginError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // First try Firebase authentication
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            formValues.email, 
            formValues.password
          );
          const firebaseUser = userCredential.user;
          
          // Set user in Redux store
          dispatch(setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Firebase User',
            role: 'admin' // Default role for Firebase users
          }));
          
          // Generate a token and set it in Redux
          const token = await firebaseUser.getIdToken();
          dispatch(setToken(token));
          
          // Store authentication in localStorage (for persistence)
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authToken', token);
          
          console.log("Firebase login successful! Redirecting...");
          
          // Get the URL from the search params (if it exists)
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirectTo');
          
          // Redirect to the originally requested URL or dashboard
          if (redirectTo && redirectTo.startsWith('/')) {
            navigate(redirectTo);
          } else {
            navigate("/dashboard");
          }
          
          return; // Exit early if Firebase auth succeeds
        } catch (firebaseError) {
          console.log("Firebase auth failed, falling back to mock auth:", firebaseError.message);
          // Continue to fallback authentication if Firebase fails
        }
        
        // Fallback to existing mock authentication
        const userTypes = ['admin', 'manager', 'customer'];
        let foundUser = null;
        
        for (const type of userTypes) {
          const user = getUserData(type);
          if (user.email === formValues.email && user.password === formValues.password) {
            foundUser = user;
            break;
          }
        }
        
        if (foundUser) {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Set user in Redux store
          dispatch(setUser({
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            role: foundUser.role
          }));
          
          // Generate a mock token and set it in Redux
          const mockToken = `auth_token_${foundUser.id}_${Date.now()}`;
          dispatch(setToken(mockToken));
          
          // Store authentication in localStorage (for persistence)
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('authToken', mockToken);
          
          console.log("Mock login successful! Redirecting...");
          
          // Get the URL from the search params (if it exists)
          const params = new URLSearchParams(window.location.search);
          const redirectTo = params.get('redirectTo');
          
          // Redirect to the originally requested URL or dashboard
          if (redirectTo && redirectTo.startsWith('/')) {
            navigate(redirectTo);
          } else {
            navigate("/dashboard");
          }
        } else {
          setLoginError("Invalid email or password");
        }
        
      } catch (error) {
        console.error('Login error:', error);
        setLoginError('An error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f8ff", // Light blue background
        backgroundImage: "linear-gradient(135deg, #e0f7fa 0%, #f1f8e9 50%, #e8f5e9 100%)", // Enhanced gradient
        padding: isMobile ? "16px" : "24px",
        boxSizing: "border-box"
      }}
    >
      <Fade in={showForm} timeout={800}>
        <Paper
          elevation={5}
          sx={{
            p: isMobile ? 3 : 4,
            width: "100%",
            maxWidth: "450px",
            borderRadius: "16px",
            backgroundColor: "white",
            boxShadow: "0 16px 40px rgba(0, 150, 136, 0.15)", // Enhanced shadow
            overflow: "hidden",
            position: "relative",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              boxShadow: "0 20px 50px rgba(0, 150, 136, 0.2)"
            }
          }}
        >
          {/* Decorative header */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              height: "8px", 
              background: "linear-gradient(90deg, #2196f3, #4caf50)" // Blue to green gradient
            }} 
          />
          
          {/* Logo */}
          <Zoom in={showForm} timeout={1000}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 2 }}>
              <Avatar
                sx={{ 
                  bgcolor: '#1976d2', // Blue
                  width: 70, 
                  height: 70,
                  boxShadow: '0 8px 16px rgba(25, 118, 210, 0.4)',
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: '0 12px 20px rgba(25, 118, 210, 0.5)'
                  }
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 38 }} />
              </Avatar>
            </Box>
          </Zoom>
          
          <Typography 
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold" 
            mb={1} 
            textAlign="center"
            sx={{ 
              color: '#1976d2', // Blue
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            Swan Sorter Admin
          </Typography>
          
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"}
            mb={3} 
            textAlign="center" 
            sx={{ color: '#4caf50' }} // Green
          >
            Login to Dashboard
          </Typography>
          
          {loginError && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ 
                mb: 2, 
                textAlign: "center", 
                fontWeight: "medium",
                padding: "8px",
                borderRadius: "4px",
                backgroundColor: "rgba(244, 67, 54, 0.08)"
              }}
            >
              {loginError}
            </Typography>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={formValues.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon sx={{ color: "#1976d2" }} />
                  </InputAdornment>
                )
              }}
            />
            
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              variant="outlined"
              value={formValues.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#1976d2" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#4caf50" }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />
            
            <Button 
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 2, 
                mb: 2, 
                py: 1.5,
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                transition: 'all 0.3s ease',
                textTransform: "none"
              }}
              startIcon={isLoading ? null : <LoginIcon />}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>OR</Divider>
            
            <Button 
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              startIcon={<GoogleIcon />}
              sx={{ 
                py: 1.5,
                color: '#4285F4',
                borderColor: '#4285F4',
                '&:hover': {
                  borderColor: '#4285F4',
                  bgcolor: 'rgba(66, 133, 244, 0.04)',
                },
                fontWeight: 600,
                transition: 'all 0.3s ease',
              }}
            >
              Sign in with Google
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Access
              </Typography>
            </Divider>
            
            {/* Demo accounts section with icons instead of text credentials */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Tooltip title="Login as Admin">
                  <Button
                    size="medium"
                    variant="outlined"
                    fullWidth
                    onClick={() => fillDemoCredentials('')}
                    sx={{ 
                      textTransform: "none",
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      height: "48px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      "&:hover": { 
                        borderColor: "#0d47a1", 
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        transform: "translateY(-2px)" 
                      }
                    }}
                  >
                    <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Login as Manager">
                  <Button
                    size="medium"
                    variant="outlined"
                    fullWidth
                    onClick={() => fillDemoCredentials('')}
                    sx={{ 
                      textTransform: "none",
                      color: "#4caf50",
                      borderColor: "#4caf50",
                      height: "48px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      "&:hover": { 
                        borderColor: "#2e7d32", 
                        backgroundColor: "rgba(76, 175, 80, 0.08)",
                        transform: "translateY(-2px)" 
                      }
                    }}
                  >
                    <SupervisorAccountIcon sx={{ fontSize: 28 }} />
                  </Button>
                </Tooltip>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title="Login as Customer">
                  <Button
                    size="medium"
                    variant="outlined"
                    fullWidth
                    onClick={() => fillDemoCredentials('')}
                    sx={{ 
                      textTransform: "none", 
                      color: "#ff9800",
                      borderColor: "#ff9800",
                      height: "48px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      "&:hover": { 
                        borderColor: "#ef6c00", 
                        backgroundColor: "rgba(255, 152, 0, 0.08)",
                        transform: "translateY(-2px)" 
                      }
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 28 }} />
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
            
            {/* App info footer */}
            <Box mt={3} sx={{ textAlign: "center" }}>
              <Typography variant="body2" sx={{ 
                color: "text.secondary", 
                fontWeight: "medium",
                marginBottom: "4px"
              }}>
                Swan Sorter Admin Panel
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                Access your dashboard to manage the platform efficiently
              </Typography>
              <Typography variant="caption" color="primary" sx={{ display: "block", mt: 0.5, fontStyle: "italic" }}>
                {/* Click on any role icon above for quick demo access */}
              </Typography>
            </Box>
          </form>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login; 