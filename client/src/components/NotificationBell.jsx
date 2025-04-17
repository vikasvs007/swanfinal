import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import {
  NotificationsOutlined,
  CheckCircleOutline,
  ErrorOutline,
  InfoOutlined,
} from "@mui/icons-material";
import { useGetNotificationsQuery } from "state/api";

const NotificationBell = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const { data: notifications = [] } = useGetNotificationsQuery();

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircleOutline sx={{ color: theme.palette.success.main }} />;
      case "error":
        return <ErrorOutline sx={{ color: theme.palette.error.main }} />;
      default:
        return <InfoOutlined sx={{ color: theme.palette.info.main }} />;
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 2 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 360,
            maxHeight: 400,
            backgroundColor: theme.palette.background.alt,
            "& .MuiMenuItem-root": {
              borderBottom: `1px solid ${theme.palette.divider}`,
              "&:last-child": {
                borderBottom: "none",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={handleClose}
              sx={{
                py: 1,
                px: 2,
                backgroundColor: notification.read
                  ? "transparent"
                  : theme.palette.action.hover,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <Box sx={{ mr: 1, mt: 0.25 }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: theme.palette.secondary[100],
                      fontWeight: notification.read ? "normal" : "bold",
                    }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.secondary[200] }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.secondary[300] }}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
