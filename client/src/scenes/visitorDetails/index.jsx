import React from "react";
import { Box, useTheme, Typography, CircularProgress, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import Header from "components/Header";

const VisitorDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box m="1.5rem 2.5rem">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/visitors')}
        sx={{ mb: 2 }}
      >
        Back to Visitors
      </Button>
      
      <Header 
        title="VISITOR DETAILS" 
        subtitle={`Details for visitor ID: ${id}`}
      />
      
      <Box mt={4}>
        <Typography variant="body1">
          This page is under construction. Visitor details will be displayed here.
        </Typography>
      </Box>
    </Box>
  );
};

export default VisitorDetails;

 