import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  QueryStatsOutlined,
  NotificationsOutlined,
  PersonOutlined,
  CalendarTodayOutlined,
  AdminPanelSettingsOutlined,
  TrendingUpOutlined,
  PieChartOutlined,
  PublicOutlined,
  LogoutOutlined,
  ArticleOutlined,
  NewspaperOutlined,
  CategoryOutlined,
  ViewCarousel,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "state";
import FlexBetween from "./FlexBetween";

const navItems = [
  {
    text: "Dashboard",
    icon: <HomeOutlined />,
  },
  {
    text: "Client Facing",
    icon: null,
  },
  {
    text: "Products",
    icon: <ShoppingCartOutlined />,
  },
  {
    text: "Orders",
    icon: <ReceiptLongOutlined />,
  },
  {
    text: "Enquiries",
    icon: <QueryStatsOutlined />,
  },
  {
    text: "Content",
    icon: null,
  },
  {
    text: "Blogs",
    icon: <ArticleOutlined />,
  },
  {
    text: "Categories",
    icon: <CategoryOutlined />,
  },
  {
    text: "News",
    icon: <NewspaperOutlined />,
  },
  {
    text: "Cards",
    icon: <ViewCarousel />,
  },
  {
    text: "Management",
    icon: null,
  },
  {
    text: "Users",
    icon: <PersonOutlined />,
  },
  {
    text: "Visitors",
    icon: <CalendarTodayOutlined />,
  },
  {
    text: "Analytics",
    icon: null,
  },
  {
    text: "Geography",
    icon: <PublicOutlined />,
  },
  {
    text: "User Statistics",
    icon: <TrendingUpOutlined />,
  },
  // {
  //   text: "Notifications",
  //   icon: <NotificationsOutlined />,
  // },
];

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  const handleLogout = () => {
    // Clear user data from Redux store
    dispatch(setUser(null));
    
    // Remove authentication from localStorage
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[700],
              backgroundColor: theme.palette.background.alt,
              boxSixing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
              backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.alt}, rgba(255, 255, 255, 0.95))`,
              boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{
                      background: theme.palette.background.gradient,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    SWANSORTER
                    ADMIN
                    DASHBOARD
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    sx={{
                      color: theme.palette.secondary[500],
                      "&:hover": {
                        color: theme.palette.secondary[700],
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Typography 
                      key={text} 
                      sx={{ 
                        m: "2.25rem 0 1rem 3rem",
                        color: theme.palette.secondary[500],
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {text}
                    </Typography>
                  );
                }
                const lcText = text.toLowerCase().replace(/\s+/g, "-");

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        // For content items, use the /admin/ prefix
                        if (["Blogs", "Categories", "News"].includes(text)) {
                          navigate(`/admin/${lcText}`);
                          setActive(`admin/${lcText}`);
                        } else {
                          navigate(`/${lcText}`);
                          setActive(lcText);
                        }
                      }}
                      sx={{
                        backgroundColor:
                          active === lcText || active === `admin/${lcText}`
                            ? theme.palette.secondary[300]
                            : "transparent",
                        backgroundImage:
                          active === lcText || active === `admin/${lcText}`
                            ? theme.palette.background.gradient
                            : "none",
                        color:
                          active === lcText || active === `admin/${lcText}`
                            ? "#ffffff"
                            : theme.palette.secondary[700],
                        borderRadius: "4px",
                        margin: "0 1rem",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                          color: active === lcText || active === `admin/${lcText}`
                            ? "#ffffff"
                            : theme.palette.secondary[900],
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === lcText || active === `admin/${lcText}`
                              ? "#ffffff"
                              : theme.palette.secondary[600],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={text} 
                        primaryTypographyProps={{
                          fontSize: "14px",
                          fontWeight: active === lcText || active === `admin/${lcText}` ? 600 : 500,
                        }}
                      />
                      {(active === lcText || active === `admin/${lcText}`) && (
                        <ChevronRightOutlined sx={{ ml: "auto", color: "#ffffff" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* Profile section at bottom */}
          {/* <Box position="absolute" bottom="2rem">
            <Divider />
            <FlexBetween textTransform="none" gap="1rem" m="1.5rem 2rem 0 3rem"> */}
              {/* <Box
                component="img"
                alt="profile"
                src={user?.photo}
                height="40px"
                width="40px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              /> */}
              {/* <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.9rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  fontSize="0.8rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {user?.role}
                </Typography>
              </Box> */}
              {/* <Tooltip title="Profile Settings">
                <IconButton onClick={() => navigate("/profile")}>
                  <AdminPanelSettingsOutlined
                    sx={{
                      color: theme.palette.secondary[300],
                      fontSize: "25px",
                    }}
                  />
                </IconButton>
              </Tooltip> */}
              {/* <Tooltip title="Logout">
                <IconButton 
                  onClick={handleLogout}
                  sx={{
                    color: theme.palette.error.light,
                  }}
                >
                  <LogoutOutlined fontSize="medium" />
                </IconButton>
              </Tooltip> */}
            {/* </FlexBetween>
          </Box> */}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
