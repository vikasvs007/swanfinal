import React, { useState } from "react";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Public as GlobeIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Computer as DeviceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetVisitorsQuery, useDeleteVisitorMutation } from "state/api";
import VisitorForm from "components/VisitorForm";

const Visitors = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetVisitorsQuery();
  const [deleteVisitor, { isLoading: isDeleting }] = useDeleteVisitorMutation();
  
  // State for CRUD operations
  const [openForm, setOpenForm] = useState(false);
  const [editVisitor, setEditVisitor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const handleAddClick = () => {
    setEditVisitor(null);
    setOpenForm(true);
  };
  
  const handleEditClick = (visitor) => {
    setEditVisitor(visitor);
    setOpenForm(true);
  };
  
  const handleDeleteClick = (visitor) => {
    setConfirmDelete(visitor);
  };
  
  const handleCloseForm = (refresh) => {
    setOpenForm(false);
    setEditVisitor(null);
  };
  
  const handleConfirmDelete = async () => {
    if (confirmDelete?._id) {
      try {
        await deleteVisitor(confirmDelete._id).unwrap();
      } catch (error) {
        console.error("Error deleting visitor:", error);
      }
    }
    setConfirmDelete(null);
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header 
          title="VISITORS" 
          subtitle="Track Website Visitors"
          icon={
            <GlobeIcon 
              sx={{ 
                fontSize: '2rem',
                color: theme.palette.secondary[300]
              }} 
            />
          }
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            backgroundImage: theme.palette.background.gradient,
            color: theme.palette.text.light,
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          Add Visitor
        </Button>
      </Box>
      
      <Box mt="40px">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {data?.visitors?.map((visitor) => (
              <Grid item xs={12} sm={6} md={4} key={visitor._id}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.background.alt,
                    borderRadius: "0.55rem",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  <Box 
                    sx={{ 
                      position: "absolute", 
                      top: "10px", 
                      right: "10px",
                      display: "flex",
                      gap: "4px"
                    }}
                  >
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditClick(visitor)}
                        sx={{ color: theme.palette.secondary[600] }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(visitor)}
                        sx={{ color: theme.palette.error.light }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <GlobeIcon 
                        sx={{ 
                          color: theme.palette.primary.main,
                          fontSize: '2rem'
                        }} 
                      />
                      <Typography 
                        variant="h6"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {visitor.ip_address}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <LocationIcon sx={{ color: theme.palette.secondary[600] }} />
                      <Typography 
                        variant="body2"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {visitor.location?.country || "Unknown Location"}
                        {visitor.location?.city && `, ${visitor.location.city}`}
                      </Typography>
                    </Box>

                    {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <DeviceIcon sx={{ color: theme.palette.secondary[300] }} />
                      <Typography 
                        variant="body2"
                        sx={{ color: theme.palette.secondary[100] }}
                      >
                        {/* {visitor.device_info || "Unknown Device"} */}
                      {/* </Typography>
                    </Box> */} 

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                      <TimeIcon sx={{ color: theme.palette.secondary[600] }} />
                      <Typography 
                        variant="caption"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        Visited: {new Date(visitor.created_at).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={visitor.visit_count > 1 ? "Returning Visitor" : "New Visitor"}
                        color={visitor.visit_count > 1 ? "success" : "primary"}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {visitor.visit_count > 1 && (
                        <Chip
                          label={`${visitor.visit_count} visits`}
                          color="default"
                          size="small"
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
      
      {/* Visitor Form Dialog */}
      <VisitorForm 
        open={openForm}
        onClose={handleCloseForm}
        visitor={editVisitor}
        isEdit={!!editVisitor}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.primary }}>
            Are you sure you want to delete this visitor record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setConfirmDelete(null)} 
            color="secondary"
            variant="outlined"
            disabled={isDeleting}
            sx={{ color: theme.palette.text.primary }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Visitors;
