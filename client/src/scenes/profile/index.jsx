import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  useTheme,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "state";
import { store } from "state/store";

const Profile = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.global.user);
  
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Saved state for detecting changes
  const [originalEmail, setOriginalEmail] = useState("");
  
  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      console.log("User data received:", user);
      const email = user.email || "";
      setFormData(prevData => ({
        ...prevData,
        email: email,
      }));
      setOriginalEmail(email);
    }
  }, [user]);
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    
    // Clear general error message
    if (error) {
      setError("");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    // Password validation
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Current password is required";
        isValid = false;
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
        isValid = false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    // Check if anything has changed
    if (formData.email === originalEmail && !formData.newPassword) {
      newErrors.general = "No changes detected to save";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError("User data not available. Please log in again.");
      return;
    }
    
    if (validateForm()) {
      setIsLoading(true);
      setError("");
      setDebugInfo(null);
      
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Create a new user object with updated email
        const updatedUser = {
          ...user,
          email: formData.email,
        };
        
        console.log("Before update - Current user state:", user);
        console.log("Updating user with:", updatedUser);
        
        // Update Redux store with the new user data
        dispatch(setUser(updatedUser));
        
        // Verify the update happened
        setTimeout(() => {
          const currentState = store.getState().global.user;
          console.log("After update - Current user state:", currentState);
          
          if (currentState?.email !== formData.email) {
            setDebugInfo({
              message: "Redux state update verification failed",
              expected: formData.email,
              actual: currentState?.email
            });
          }
        }, 500);
        
        // Update localStorage if you're storing user data there
        if (localStorage.getItem('isAuthenticated') === 'true') {
          try {
            // For demo purposes, we're not actually storing sensitive data in localStorage
            // This would be handled differently in a real app with proper JWT tokens
            console.log("User profile updated successfully");
            setOriginalEmail(formData.email);
          } catch (localStorageError) {
            console.error("LocalStorage update error:", localStorageError);
          }
        }
        
        // Show success message
        setSuccess(true);
        
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } catch (err) {
        console.error("Profile update error:", err);
        setError("Failed to update profile. Please try again.");
        setDebugInfo({
          message: "Error updating profile",
          error: err.message || String(err)
        });
      } finally {
        setIsLoading(false);
      }
    } else if (errors.general) {
      setError(errors.general);
    }
  };

  // Manual update function - alternative approach if the Redux dispatch isn't working
  const forceUserUpdate = () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Deep clone the user object to ensure we create a new reference
      const updatedUser = JSON.parse(JSON.stringify(user));
      updatedUser.email = formData.email;
      
      console.log("Force updating user with:", updatedUser);
      
      // Update Redux store with the new user data
      dispatch(setUser(updatedUser));
      
      // Update original email to match new one
      setOriginalEmail(formData.email);
      
      // Show success and reset form
      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      
      setError("");
    } catch (err) {
      console.error("Force update error:", err);
      setError("Failed to update profile: " + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // If user data is not available, show loading or redirect
  if (!user) {
    return (
      <Box m="1.5rem 2.5rem">
        <Header title="PROFILE SETTINGS" subtitle="Manage your account information" />
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Typography variant="h5" color="text.secondary">
            Please log in to access your profile settings.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="PROFILE SETTINGS" subtitle="Manage your account information" />
      
      <Box mt={4}>
        <Card
          sx={{
            backgroundImage: "none",
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.55rem",
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Avatar
                src={user?.photo}
                sx={{
                  width: 80,
                  height: 80,
                  border: `3px solid ${theme.palette.primary.main}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ ml: 3 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.secondary[100] }}>
                  {user?.name || "User"}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.secondary[200] }}>
                  {user?.role || "User"}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.secondary[200], mt: 1 }}>
                  {user?.email ? `Currently using: ${user.email}` : "No email set"}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.secondary[300] }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Typography variant="h6" sx={{ color: theme.palette.secondary[100], mt: 2 }}>
                  Change Password
                </Typography>

                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.secondary[300] }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility("current")}
                          edge="end"
                        >
                          {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="New Password"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.secondary[300] }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility("new")}
                          edge="end"
                        >
                          {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: theme.palette.secondary[300] }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility("confirm")}
                          edge="end"
                        >
                          {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={forceUserUpdate}
                    disabled={isLoading || formData.email === originalEmail}
                    sx={{
                      borderColor: theme.palette.secondary[300],
                      color: theme.palette.secondary[300],
                      "&:hover": {
                        borderColor: theme.palette.secondary[100],
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      },
                    }}
                  >
                    Force Update
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      backgroundColor: theme.palette.secondary[300],
                      color: theme.palette.background.alt,
                      "&:hover": {
                        backgroundColor: theme.palette.secondary[100],
                      },
                      minWidth: "150px",
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </Box>
              </Box>
            </form>
            
            {debugInfo && (
              <Paper 
                elevation={0} 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '4px',
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">Debug Information:</Typography>
                <pre style={{ 
                  overflowX: 'auto', 
                  fontSize: '12px',
                  marginTop: '8px'
                }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          icon={<CheckIcon fontSize="inherit" />}
          sx={{ width: "100%" }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 