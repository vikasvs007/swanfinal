import React, { useEffect } from "react";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Home as HomeIcon } from "@mui/icons-material";

const NotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Log details for debugging
  useEffect(() => {
    console.log("404 Not Found - Current path:", location.pathname);
    console.log("URL parameters:", location.search);
  }, [location]);
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "5rem", md: "8rem" },
          fontWeight: 700,
          color: theme.palette.secondary[300],
          mb: 2,
        }}
      >
        404
      </Typography>
      
      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: "1.5rem", md: "2rem" },
          fontWeight: 500,
          color: theme.palette.secondary[100],
          mb: 3,
        }}
      >
        Page Not Found
      </Typography>
      
      <Typography
        variant="body1"
        sx={{
          color: theme.palette.secondary[300],
          mb: 4,
          maxWidth: "600px",
        }}
      >
        The page you are looking for might have been removed, had its
        name changed, or is temporarily unavailable. Current path: {location.pathname}
      </Typography>
      
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate("/")}
        sx={{
          backgroundColor: theme.palette.secondary[300],
          color: theme.palette.primary.contrastText,
          "&:hover": {
            backgroundColor: theme.palette.secondary[200],
          },
        }}
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default NotFound; 