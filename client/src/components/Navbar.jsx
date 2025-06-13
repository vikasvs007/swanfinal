import React, { useState } from "react";
import {
  Menu as MenuIcon,
  Search,
  ArrowDropDownOutlined,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import { useDispatch } from "react-redux";
import { logout } from "state";
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
  Avatar,
  Divider,
  ListItemIcon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationBell from "components/NotificationBell";
import profileImage from "assets/image.png";

const Navbar = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    // Use the logout action to clear user and token in one step
    dispatch(logout());
    
    // Remove authentication from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <AppBar
      sx={{
        position: "static",
        background: "none",
        boxShadow: "none",
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* LEFT SIDE */}
        <FlexBetween>
          <IconButton 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            sx={{
              color: theme.palette.secondary[700],
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.secondary[900],
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <FlexBetween
            backgroundColor={theme.palette.background.alt}
            borderRadius="12px"
            gap="3rem"
            p="0.1rem 1.5rem"
            sx={{
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <InputBase 
              placeholder="Search..." 
              sx={{ 
                color: theme.palette.secondary[700],
                "& ::placeholder": {
                  color: theme.palette.secondary[400],
                  opacity: 0.7,
                }
              }}
            />
            <IconButton
              sx={{
                color: theme.palette.secondary[700],
                "&:hover": {
                  color: theme.palette.secondary[900],
                }
              }}
            >
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        {/* RIGHT SIDE */}
        <FlexBetween gap="1.5rem">
          {user && user._id && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationBell />
            </Box>
          )}
          <Box>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                alignItems: "center",
                textTransform: "none",
                gap: "1rem",
                borderRadius: "12px",
                padding: "6px 14px",
                backgroundColor: isOpen ? theme.palette.action.selected : "transparent",
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transform: "translateY(-1px)",
                }
              }}
            >
              <Avatar
                src={user?.photo || profileImage}
                sx={{ 
                  width: 36, 
                  height: 36,
                  border: `2px solid ${theme.palette.primary[400]}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography
                  variant="subtitle2"
                  component="span"
                  sx={{ 
                    color: theme.palette.secondary[700],
                    fontWeight: "600"
                  }}
                >
                  Hi, {user?.name?.split(' ')[0] || 'SwanSorter'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: theme.palette.secondary[500],
                    fontSize: "0.75rem"
                  }}
                >
                  {user?.role || 'Admin'}
                </Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ 
                  color: theme.palette.secondary[500], 
                  fontSize: "25px",
                  transition: "transform 0.2s ease",
                  transform: isOpen ? "rotate(180deg)" : "none"
                }}
              />
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  backgroundColor: theme.palette.background.alt,
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: "hidden",
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <FlexBetween>
                  <Avatar
                    src={user?.photo || profileImage}
                    sx={{ 
                      width: 48, 
                      height: 48,
                      border: `2px solid ${theme.palette.primary[400]}`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: theme.palette.secondary[700],
                        fontWeight: "600"
                      }}
                    >
                      {user?.name || 'SwanSorter'}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.secondary[500],
                        fontSize: "0.75rem"
                      }}
                    >
                      {user?.email || 'SwanSorter@swansorter.com'}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.primary.main,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mt: 0.5
                      }}
                    >
                      <AdminIcon sx={{ fontSize: 14 }} />
                      {user?.role || 'Admin'}
                    </Typography>
                  </Box>
                </FlexBetween>
              </Box>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{
                borderRadius: "8px",
                mx: 1,
                my: 0.5,
                '&:hover': {
                  background: theme.palette.error[400],
                  color: "#fff"
                }
              }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color={theme.palette.secondary[700]} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
