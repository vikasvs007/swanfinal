import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  useTheme,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  ViewCarousel as CardIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { 
  useGetCardsQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
  useUploadCardImageMutation
} from "state/api";

const Cards = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // API hooks
  const { data: cards, isLoading: isLoadingCards, refetch } = useGetCardsQuery();
  const [uploadCardImage, { isLoading: isUploading }] = useUploadCardImageMutation();
  const [createCard, { isLoading: isCreating }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdating }] = useUpdateCardMutation();
  const [deleteCard, { isLoading: isDeleting }] = useDeleteCardMutation();
  
  const isLoading = isLoadingCards || isCreating || isUpdating || isDeleting || isUploading;
  
  const handleOpenDialog = (card = null) => {
    if (card) {
      // Edit mode
      setEditingCard(card);
      setTitle(card.title);
      setMessage(card.message);
      setPreviewUrl(card.image);
    } else {
      // Add mode
      setEditingCard(null);
      setTitle("");
      setMessage("");
      setImageFile(null);
      setPreviewUrl("");
    }
    setOpen(true);
  };
  
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleOpenDetailView = (card) => {
    setSelectedCard(card);
    setDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setDetailViewOpen(false);
    setSelectedCard(null);
  };
  
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL for immediate display
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async () => {
    try {
      if (!title || !message) {
        setSnackbar({
          open: true,
          message: "Title and message are required",
          severity: "error",
        });
        return;
      }
      
      if (!editingCard && !previewUrl) {
        setSnackbar({
          open: true,
          message: "Please select an image for the card",
          severity: "error",
        });
        return;
      }

      // Prepare data for API call
      const cardData = {
        title,
        message,
        image: previewUrl // This is already a base64 string from handleImageChange
      };
      
      if (editingCard) {
        // Update existing card
        await updateCard({
          id: editingCard._id,
          ...cardData
        }).unwrap();
        
        setSnackbar({
          open: true,
          message: "Card updated successfully!",
          severity: "success",
        });
      } else {
        // Create new card
        await createCard(cardData).unwrap();
        
        setSnackbar({
          open: true,
          message: "Card created successfully!",
          severity: "success",
        });
      }
      
      handleCloseDialog();
      refetch();
    } catch (error) {
      console.error("Error saving card:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.data?.message || "Something went wrong"}`,
        severity: "error",
      });
    }
  };
  
  const handleDeleteCard = async (id) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        await deleteCard(id).unwrap();
        setSnackbar({
          open: true,
          message: "Card deleted successfully!",
          severity: "success",
        });
        refetch();
      } catch (error) {
        console.error("Error deleting card:", error);
        setSnackbar({
          open: true,
          message: `Error: ${error.data?.message || "Something went wrong"}`,
          severity: "error",
        });
      }
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header 
          title="CARDS MANAGEMENT" 
          subtitle="Manage promotional cards on your website"
          icon={<CardIcon sx={{ fontSize: "2rem", color: theme.palette.secondary[300] }} />}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={isLoading}
        >
          Add New Card
        </Button>
      </Box>
      
      {isLoadingCards ? (
        <Box display="flex" justifyContent="center" m="2rem 0">
          <CircularProgress />
        </Box>
      ) : !cards || cards.length === 0 ? (
        <Box mt="2rem">
          <Typography variant="h6" color={theme.palette.secondary[300]} textAlign="center">
            No cards found. Create your first card!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} mt="20px">
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  backgroundColor: theme.palette.background.alt,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={card.image}
                  alt={card.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div" color={theme.palette.secondary[100]}>
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={theme.palette.secondary[300]}
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {card.message}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <IconButton 
                      aria-label="edit"
                      onClick={() => handleOpenDialog(card)}
                      color="info"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete"
                      onClick={() => handleDeleteCard(card._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleOpenDetailView(card)}
                  >
                    View More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCard ? "Edit Card" : "Add New Card"}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Message"
              type="text"
              fullWidth
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={4}
              required
              sx={{ mt: 2 }}
            />
            
            <Box mt={3}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<ImageIcon />}
                sx={{ mb: 2 }}
              >
                {editingCard ? "Change Image" : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
              
              {previewUrl && (
                <Box mt={2} textAlign="center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'contain',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={!title || !message || (!editingCard && !previewUrl) || isLoading}
          >
            {isCreating || isUpdating ? (
              <CircularProgress size={24} />
            ) : (
              editingCard ? "Update" : "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Detail View Dialog */}
      <Dialog
        open={detailViewOpen}
        onClose={handleCloseDetailView}
        maxWidth="md"
        fullWidth
      >
        {selectedCard && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              bgcolor: theme.palette.background.alt,
              color: theme.palette.secondary[100]
            }}>
              <Typography variant="h5" component="div">
                {selectedCard.title}
              </Typography>
              <IconButton onClick={handleCloseDetailView} color="inherit">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: theme.palette.background.alt }}>
              <img
                src={selectedCard.image}
                alt={selectedCard.title}
                style={{ 
                  width: '100%', 
                  maxHeight: '400px', 
                  objectFit: 'contain',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                  padding: '20px 0'
                }}
              />
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  m: 2, 
                  bgcolor: theme.palette.background.default,
                  color: theme.palette.secondary[200]
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedCard.message}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ bgcolor: theme.palette.background.alt }}>
              <Button onClick={handleCloseDetailView} color="primary">
                Close
              </Button>
              <Button 
                onClick={() => {
                  handleCloseDetailView();
                  handleOpenDialog(selectedCard);
                }} 
                color="info"
                variant="outlined"
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Cards; 