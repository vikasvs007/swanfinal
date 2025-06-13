import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Grid,
  useTheme,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  IconButton,
  InputAdornment,
  Autocomplete,
  Stack,
  InputLabel,
  Select,
  FormControl,
  FormHelperText,
} from "@mui/material";
import {
  AddPhotoAlternate as ImageIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";
import { useCreateBlogMutation, useUpdateBlogMutation, useGetBlogCategoriesQuery } from "state/api";
import { formatImageUrl } from "utils/helpers";

const BlogForm = ({ open, onClose, blog = null, isEdit = false }) => {
  const theme = useTheme();
  // Get API base URL from environment or fallback
  const apiBaseUrl = process.env.REACT_APP_BASE_URL?.replace('/api', '') || "https://swanbackend.onrender.com";
  
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const { data: categories } = useGetBlogCategoriesQuery();

  const isLoading = isCreating || isUpdating;
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "News",
    tags: [],
    featured_image: "",
    status: "Draft",
    is_featured: false,
  });

  // Tags input state
  const [tagInput, setTagInput] = useState("");
  
  // Initialize form with blog data when editing
  useEffect(() => {
    if (blog && isEdit) {
      setFormData({
        title: blog.title || "",
        content: blog.content || "",
        excerpt: blog.excerpt || "",
        category: blog.category || "News",
        tags: blog.tags || [],
        featured_image: blog.featured_image || "",
        status: blog.status || "Draft",
        is_featured: blog.is_featured || false,
      });
    } else {
      // Reset form for new blog
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "News",
        tags: [],
        featured_image: "",
        status: "Draft",
        is_featured: false,
      });
    }
  }, [blog, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox separately
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Auto-generate excerpt from content if not already provided
    if (name === "content" && !formData.excerpt.trim()) {
      const excerpt = value.substring(0, 150) + (value.length > 150 ? "..." : "");
      setFormData(prev => ({
        ...prev,
        excerpt,
      }));
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create a new FileReader instance
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const img = new Image();
          img.src = e.target.result;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          // Create canvas with original dimensions
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate dimensions while preserving aspect ratio
          let width = img.width;
          let height = img.height;
          
          // If image is too large, scale it down
          const MAX_DIMENSION = 1600;
          const MAX_PIXEL_COUNT = 3 * 1024 * 1024; // 3 million pixels
          
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          
          // Check total pixel count
          if (width * height > MAX_PIXEL_COUNT) {
            const scale = Math.sqrt(MAX_PIXEL_COUNT / (width * height));
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw image with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality adjustment
          let quality = 0.9;
          let base64String = canvas.toDataURL(file.type, quality);
          
          // If the base64 string is still too large, reduce quality
          while (base64String.length > 800 * 1024 && quality > 0.1) {
            quality -= 0.1;
            base64String = canvas.toDataURL(file.type, quality);
          }
          
          // Update form data based on type
          if (type === 'featured') {
            setFormData(prev => ({ ...prev, featured_image: base64String }));
          } else if (type === 'gallery') {
            setFormData(prev => ({
              ...prev,
              gallery: [...(prev.gallery || []), base64String]
            }));
          }
          
          setError(null);
        } catch (error) {
          console.error('Error processing image:', error);
          setError('Failed to process image. Please try again with a different image.');
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read image file. Please try again.');
        setIsProcessing(false);
      };
      
      // Read the file as Data URL (base64)
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error handling file:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  // Helper function to detect transparency in images
  const hasTransparency = (image) => {
    try {
      // Create a small canvas to test for transparency
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(image.width, 100); // Sample a portion of the image
      canvas.height = Math.min(image.height, 100);
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Get image data and check for non-opaque pixels
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) { // Check alpha channel
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Error checking for transparency:', e);
      return false; // Default to no transparency if there's an error
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!formData.featured_image) {
      setError('Featured image is required');
      return;
    }

    try {
      setIsProcessing(true);
      if (isEdit) {
        await updateBlog({ id: blog._id, ...formData }).unwrap();
      } else {
        await createBlog(formData).unwrap();
      }
      onClose(true);
    } catch (error) {
      console.error('Error submitting blog:', error);
      if (error.data?.message) {
        setError(error.data.message);
      } else if (error.error) {
        setError(error.error);
      } else {
        setError('Failed to save blog. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Blog categories options
  const categoryOptions = [
    "News",
    "Updates",
    "Tutorials",
    "Events",
    "Other",
  ];

  // Blog status options
  const statusOptions = [
    "Draft",
    "Published",
    "Archived",
  ];

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.background.alt,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DialogTitle sx={{ color: theme.palette.text.primary }}>
        {isEdit ? "Edit Blog" : "Add New Blog"}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Title"
                value={formData.title}
                onChange={handleChange}
                fullWidth
                required
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                name="content"
                label="Content"
                value={formData.content}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={10}
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'featured')}
                />
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
                  Featured Image
                </Typography>
                {formData.featured_image === 'uploading' ? (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    width: '100%',
                    height: '200px',
                    border: `1px dashed ${theme.palette.divider}`,
                    borderRadius: '8px',
                  }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ ml: 2, color: theme.palette.text.primary }}>
                      Processing...
                    </Typography>
                  </Box>
                ) : formData.featured_image ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <Box
                      component="img"
                      src={formData.featured_image}
                      alt="Featured"
                      sx={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      }}
                      onError={(e) => {
                        console.error('Image preview failed to load:', formData.featured_image);
                        // Show error state instead of broken image
                        e.target.src = 'https://via.placeholder.com/400x200?text=Image+Load+Error';
                      }}
                    />
                    <IconButton
                      onClick={() => setFormData(prev => ({ ...prev, featured_image: "" }))}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: '#fff',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={triggerFileInput}
                    sx={{
                      width: '100%',
                      height: '200px',
                      borderStyle: 'dashed',
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                    }}
                    disabled={isProcessing}
                  >
                    Add Image
                  </Button>
                )}
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <TextField
                  select
                  name="category"
                  label="Category"
                  value={formData.category}
                  onChange={handleChange}
                  fullWidth
                  variant="filled"
                  sx={{
                    "& .MuiInputBase-input": {
                      color: theme.palette.text.primary,
                    },
                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.primary,
                    },
                    mb: 2,
                  }}
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                
                <TextField
                  select
                  name="status"
                  label="Status"
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                  variant="filled"
                  sx={{
                    "& .MuiInputBase-input": {
                      color: theme.palette.text.primary,
                    },
                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.primary,
                    },
                    mb: 2,
                  }}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
                    Tags
                  </Typography>
                  <TextField
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add a tag and press Enter"
                    fullWidth
                    variant="filled"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton 
                            onClick={addTag}
                            edge="end"
                            disabled={!tagInput.trim()}
                          >
                            <AddIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: theme.palette.text.primary,
                      },
                      mb: 1,
                    }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => removeTag(tag)}
                        color="primary"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="excerpt"
                label="Excerpt (Brief summary)"
                value={formData.excerpt}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={3}
                variant="filled"
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                  },
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.primary,
                  },
                  mb: 2,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={() => onClose(false)} 
          color="secondary"
          variant="outlined"
          disabled={isProcessing}
          sx={{ color: theme.palette.text.primary }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary"
          variant="contained"
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          sx={{
            backgroundImage: theme.palette.background.gradient,
            color: theme.palette.text.light,
            "&:hover": {
              backgroundImage: theme.palette.background.hoverGradient,
            }
          }}
        >
          {isProcessing ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogForm; 