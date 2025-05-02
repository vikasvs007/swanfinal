import React, { useState } from "react";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  Pagination,
} from "@mui/material";
import {
  Article as ArticleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  LocalOffer as TagIcon,
  Category as CategoryIcon,
  BookmarkBorder as BookmarkIcon,
  BookmarkAdded as BookmarkFilledIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetBlogsQuery, useDeleteBlogMutation } from "state/api";
import { useNavigate } from "react-router-dom";
import BlogForm from "components/BlogForm";
import { formatImageUrl, formatDate } from "utils/helpers";

const Blogs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    featured: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get API base URL from environment or fallback
  const apiBaseUrl = process.env.REACT_APP_BASE_URL?.replace('/api', '') || "https://swanbackend.onrender.com";
  
  // Get blogs with filtering and pagination
  const { data, isLoading, refetch, error } = useGetBlogsQuery({
    search: searchTerm,
    status: filters.status,
    category: filters.category,
    featured: filters.featured,
    page: currentPage,
    limit: 6,
  });
  
  // Refetch data on component mount
  React.useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [refetch]);
  
  // Log data for debugging
  React.useEffect(() => {
    console.log("Blogs data:");
    if (error) {
      console.error("Error fetching blogs:", error);
    }
  }, [data, error]);
  
  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  
  // State for CRUD operations
  const [openForm, setOpenForm] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Handle blog actions
  const handleAddClick = () => {
    setEditBlog(null);
    setOpenForm(true);
  };
  
  const handleEditClick = (blog) => {
    setEditBlog(blog);
    setOpenForm(true);
  };
  
  const handleDeleteClick = (blog) => {
    setConfirmDelete(blog);
  };
  
  const handleViewClick = (blog) => {
    // Use React Router navigation instead of window.open
    // console.log("Navigating to blog:", blog._id);
    // Option 1: Navigate in same tab
    navigate(`/blogs/${blog._id}`);
    
    // Option 2: For opening in new tab, we'll keep the window.open
    // const baseUrl = window.location.origin;
    // window.open(`${baseUrl}/blogs/${blog._id}`, '_blank');
  };
  
  const handleCloseForm = (refresh) => {
    setOpenForm(false);
    setEditBlog(null);
    if (refresh) {
      refetch();
    }
  };
  
  const handleConfirmDelete = async () => {
    if (confirmDelete?._id) {
      try {
        await deleteBlog(confirmDelete._id).unwrap();
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
    setConfirmDelete(null);
  };
  
  // Handle search and filters
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };
  
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  const clearFilters = () => {
    setFilters({
      status: "",
      category: "",
      featured: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };
  
  // Handle pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Published':
        return 'success';
      case 'Draft':
        return 'info';
      case 'Archived':
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Filter options
  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "News", label: "News" },
    { value: "Updates", label: "Updates" },
    { value: "Tutorials", label: "Tutorials" },
    { value: "Events", label: "Events" },
    { value: "Other", label: "Other" },
  ];
  
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Draft", label: "Draft" },
    { value: "Published", label: "Published" },
    { value: "Archived", label: "Archived" },
  ];
  
  const featuredOptions = [
    { value: "", label: "All Blogs" },
    { value: "true", label: "Featured Only" },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header 
          title="BLOGS" 
          subtitle="Manage Your Blog Content"
          icon={
            <ArticleIcon 
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
            backgroundColor: theme.palette.secondary[300],
            color: theme.palette.background.alt,
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          Add Blog Post
        </Button>
      </Box>
      
      {/* Search and Filters */}
      <Box mt="20px" mb="20px">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: theme.palette.background.alt,
                borderRadius: "10px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.secondary[200],
                  },
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant={showFilters ? "contained" : "outlined"}
              color="secondary"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            
            {(filters.status || filters.category || filters.featured || searchTerm) && (
              <Button
                variant="outlined"
                color="error"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Grid>
          
          {showFilters && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                mt: 1, 
                backgroundColor: theme.palette.background.alt,
                borderRadius: "10px",
                border: `1px solid ${theme.palette.divider}`
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      name="category"
                      label="Category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      variant="filled"
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      name="status"
                      label="Status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      variant="filled"
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      fullWidth
                      name="featured"
                      label="Featured"
                      value={filters.featured}
                      onChange={handleFilterChange}
                      variant="filled"
                    >
                      {featuredOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      
      <Box mt="40px">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              backgroundColor: theme.palette.background.alt,
              borderRadius: '10px',
              border: `1px dashed ${theme.palette.error.main}`
            }}
          >
            <Typography variant="h5" sx={{ color: theme.palette.error.main, mb: 1 }}>
              Error Loading Blogs
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.secondary[300], mb: 3 }}>
              {error?.data?.message || error?.error || "Could not fetch blog data. Please try again."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </Box>
        ) : !data?.blogs || data.blogs.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              backgroundColor: theme.palette.background.alt,
              borderRadius: '10px',
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <ArticleIcon sx={{ fontSize: 60, color: theme.palette.secondary[200], mb: 2 }} />
            <Typography variant="h5" sx={{ color: theme.palette.secondary[100], mb: 1 }}>
              No blogs found
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.secondary[300], mb: 3 }}>
              {searchTerm || filters.status || filters.category || filters.featured
                ? "Try adjusting your search filters"
                : "Get started by creating your first blog post"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Create Blog Post
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {data.blogs.map((blog) => (
                <Grid item xs={12} sm={6} md={4} key={blog._id}>
                  <Card
                    sx={{
                      backgroundColor: theme.palette.background.alt,
                      borderRadius: "0.55rem",
                      height: "100%",
                      display: 'flex',
                      flexDirection: 'column',
                      position: "relative",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    {blog.is_featured && (
                      <Tooltip title="Featured Blog">
                        <BookmarkFilledIcon
                          sx={{
                            position: 'absolute',
                            top: -5,
                            right: 20,
                            color: theme.palette.warning.main,
                            fontSize: '2rem',
                            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))',
                            zIndex: 1,
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    <Box 
                      sx={{ 
                        position: "absolute", 
                        top: "10px", 
                        right: "10px",
                        display: "flex",
                        gap: "4px",
                        zIndex: 1,
                      }}
                    >
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(blog)}
                          sx={{ 
                            color: "#fff",
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            '&:hover': {
                              backgroundColor: theme.palette.secondary[300],
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(blog)}
                          sx={{ 
                            color: "#fff",
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            '&:hover': {
                              backgroundColor: theme.palette.error.main,
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <CardMedia
                      component="div"
                      sx={{
                        height: '160px',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                      }}
                    >
                      <Box
                        component="img"
                        src={blog.featured_image}
                        alt={blog.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', blog.featured_image);
                          e.target.src = 'https://via.placeholder.com/600x300?text=No+Image';
                        }}
                      />
                    </CardMedia>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          icon={<CategoryIcon sx={{ fontSize: '0.8rem !important' }} />}
                          label={blog.category} 
                          size="small" 
                          color="primary"
                          sx={{ height: '22px' }}
                        />
                        <Chip 
                          label={blog.status} 
                          size="small" 
                          color={getStatusColor(blog.status)}
                          sx={{ height: '22px' }}
                        />
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          color: theme.palette.text.primary,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {blog.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          color: theme.palette.text.primary,
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {blog.excerpt}
                      </Typography>
                      
                      {blog.tags && blog.tags.length > 0 && (
                        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {blog.tags.slice(0, 3).map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: '20px', 
                                fontSize: '0.7rem',
                                borderColor: theme.palette.secondary[300],
                                color: theme.palette.text.primary,
                              }}
                            />
                          ))}
                          {blog.tags.length > 3 && (
                            <Chip
                              label={`+${blog.tags.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: '20px', 
                                fontSize: '0.7rem',
                                borderColor: theme.palette.secondary[300],
                                color: theme.palette.text.primary,
                              }}
                            />
                          )}
                        </Box>
                      )}
                      
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewClick(blog)}
                        startIcon={<VisibilityIcon />}
                        sx={{ 
                          mb: 2,
                          backgroundColor: theme.palette.secondary[300],
                          '&:hover': { 
                            backgroundColor: theme.palette.secondary.light 
                          }
                        }}
                      >
                        Read Blog
                      </Button>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mt: 2
                      }}>
                        <Typography 
                          variant="caption" 
                          sx={{ color: theme.palette.text.primary }}
                        >
                          {blog.published_date 
                            ? `Published on ${formatDate(blog.published_date)}` 
                            : `Created on ${formatDate(blog.created_at)}`}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon 
                            sx={{ 
                              fontSize: '0.9rem', 
                              color: theme.palette.text.primary,
                              mr: 0.5
                            }} 
                          />
                          <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                            {blog.views || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination */}
            {data.pagination && data.pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={data.pagination.pages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Blog Form Dialog */}
      <BlogForm 
        open={openForm}
        onClose={handleCloseForm}
        blog={editBlog}
        isEdit={!!editBlog}
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
            Are you sure you want to delete the blog "{confirmDelete?.title}"? This action cannot be undone.
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

export default Blogs; 