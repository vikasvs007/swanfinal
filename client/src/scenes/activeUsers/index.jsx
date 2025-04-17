import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetActiveUsersQuery } from "state/api";
import analyticsService from "services/firebaseAnalytics";

const ActiveUsers = () => {
  const theme = useTheme();
  const { data: backendData, isLoading: isLoadingBackend, refetch } = useGetActiveUsersQuery();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);
  
  // Get Firebase Analytics active users
  useEffect(() => {
    fetchFirebaseUsers();
  }, []);
  
  const fetchFirebaseUsers = () => {
    setIsLoadingFirebase(true);
    
    try {
      // Get users from our analytics service
      const activeUsers = analyticsService.getActiveUsers();
      
      // Process the users to match the expected format
      const formattedUsers = activeUsers.map(user => ({
        _id: user.id,
        user_id: {
          name: user.name,
          email: user.email,
        },
        session_duration: calculateSessionDuration(user.sessionStart, user.lastActive),
        last_activity: user.lastActive,
        is_online: user.isOnline,
        source: 'firebase'
      }));
      
      setFirebaseUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching Firebase users:', error);
      setSnackbar({
        open: true,
        message: `Error fetching Firebase users: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsLoadingFirebase(false);
    }
  };
  
  // Calculate session duration in seconds
  const calculateSessionDuration = (start, last) => {
    const startTime = new Date(start).getTime();
    const lastTime = new Date(last).getTime();
    return Math.floor((lastTime - startTime) / 1000);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      // Refresh both data sources
      await refetch();
      fetchFirebaseUsers();
      
      setSnackbar({
        open: true,
        message: 'Active users data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setSnackbar({
        open: true,
        message: `Error refreshing data: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  // Combine users from both sources, remove duplicates by ID
  const combineUsers = () => {
    const backendUsers = backendData?.activeUsers || [];
    const combinedUsers = [...backendUsers];
    
    // Add Firebase users if they don't already exist (by ID)
    firebaseUsers.forEach(fbUser => {
      if (!combinedUsers.some(user => user._id === fbUser._id)) {
        combinedUsers.push(fbUser);
      }
    });
    
    return combinedUsers;
  };
  
  const combinedUsers = combineUsers();
  const isLoading = isLoadingBackend || isLoadingFirebase;

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="ACTIVE USERS"
          subtitle="Monitor Currently Active Users from Firebase and Backend"
          icon={
            <PersonIcon
              sx={{
                fontSize: "2rem",
                color: theme.palette.secondary[300],
              }}
            />
          }
        />
        <Button
          variant="contained"
          startIcon={isRefreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={handleRefreshData}
          disabled={isRefreshing}
          sx={{
            backgroundColor: theme.palette.secondary[300],
            color: theme.palette.background.alt,
            "&:hover": {
              backgroundColor: theme.palette.secondary[100],
            },
          }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      <Box mt="40px">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : combinedUsers.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <Typography variant="h5" color="text.secondary">
              No active users at the moment
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {combinedUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.background.alt,
                    borderRadius: "0.55rem",
                    height: "100%",
                    border: user.source === 'firebase' ? `1px solid ${theme.palette.primary.main}` : 'none',
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: user.source === 'firebase' ? theme.palette.primary.main : theme.palette.secondary[300],
                          width: 48,
                          height: 48,
                        }}
                      >
                        {user.user_id?.name?.charAt(0) || "U"}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {user.user_id?.name || "Unknown User"}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {user.user_id?.email || "No email"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        mb: 1,
                      }}
                    >
                      <TimeIcon sx={{ color: theme.palette.secondary[300] }} />
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        Session Duration:{" "}
                        {Math.floor(user.session_duration / 60)} minutes
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        Last Activity:{" "}
                        {new Date(user.last_activity).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={user.is_online ? "Online" : "Away"}
                        color={user.is_online ? "success" : "warning"}
                        size="small"
                        sx={{
                          mt: 1,
                        }}
                      />
                      
                      {user.source === 'firebase' && (
                        <Chip
                          label="Firebase"
                          color="primary"
                          size="small"
                          sx={{
                            mt: 1,
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ActiveUsers;
