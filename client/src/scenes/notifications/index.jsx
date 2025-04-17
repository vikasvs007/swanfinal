import React from "react";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import {
  NotificationsActive as NotificationIcon,
  CheckCircleOutline as ReadIcon,
  RadioButtonUnchecked as UnreadIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetNotificationsQuery } from "state/api";

const Notifications = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetNotificationsQuery();

  return (
    <Box m="1.5rem 2.5rem">
      <Header 
        title="NOTIFICATIONS" 
        subtitle="Manage System Notifications"
        icon={
          <NotificationIcon 
            sx={{ 
              fontSize: '2rem',
              color: theme.palette.secondary[300]
            }} 
          />
        }
      />
      
      <Box mt="40px">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {data?.notifications?.map((notification) => (
              <Grid item xs={12} sm={6} md={4} key={notification._id}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.background.alt,
                    borderRadius: "0.55rem",
                    height: "100%",
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <CardContent>
                    <Box sx={{ position: "absolute", top: -12, right: 12 }}>
                      <Chip
                        icon={notification.is_read ? <ReadIcon /> : <UnreadIcon />}
                        label={notification.is_read ? "Read" : "Unread"}
                        color={notification.is_read ? "default" : "primary"}
                        size="small"
                        sx={{ 
                          '& .MuiChip-icon': {
                            fontSize: '1.1rem'
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2, mt: 1 }}>
                      <NotificationIcon 
                        sx={{ 
                          color: notification.is_read ? theme.palette.secondary[300] : theme.palette.primary.main,
                          fontSize: '2rem'
                        }} 
                      />
                      <Typography 
                        variant="body1"
                        sx={{ 
                          color: theme.palette.secondary[100],
                          flex: 1
                        }}
                      >
                        {notification.message}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                      <TimeIcon sx={{ color: theme.palette.secondary[300], fontSize: "1.1rem" }} />
                      <Typography 
                        variant="caption"
                        sx={{ color: theme.palette.secondary[300] }}
                      >
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </Box>

                    {notification.user_id && (
                      <Typography 
                        variant="caption"
                        sx={{ 
                          color: theme.palette.secondary[300],
                          display: "block",
                          mt: 1
                        }}
                      >
                        For: {notification.user_id.name || "Unknown User"}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Notifications;
