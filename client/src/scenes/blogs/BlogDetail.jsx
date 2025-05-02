import React, { useState } from "react";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  Chip,
  Button,
  IconButton,
  Container,
  Grid,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as TimeIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BookmarkAdded as FeaturedIcon,
  Share as ShareIcon,
  CalendarTodayOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useGetBlogQuery, useDeleteBlogMutation } from "state/api";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import BlogForm from "components/BlogForm";
import ConfirmDialog from "components/ConfirmDialog";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useSelector } from "react-redux";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.css';
import { formatImageUrl, formatDate } from "utils/helpers";

const GalleryFallback = ({ images }) => {
  if (!images || images.length === 0) {
    return <Typography>No gallery images to display</Typography>;
  }
  
  return (
    <Grid container spacing={2}>
      {images.map((image, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Box 
            component="img"
            src={formatImageUrl(image)}
            alt={`Gallery image ${index + 1}`}
            sx={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
            onError={(e) => {
              console.error('Error loading gallery image:', image);
              e.target.src = 'https://via.placeholder.com/600x300?text=Image+Not+Available';
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const BlogDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.global.token);
  
  // Get API base URL from environment or fallback
  const apiBaseUrl = process.env.REACT_APP_BASE_URL?.replace('/api', '') || "https://swanbackend.onrender.com";
  
  // State management
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Fetch blog data
  const { data, isLoading, refetch, error } = useGetBlogQuery(id);
  
  // More extensive debugging to track down the issue
  React.useEffect(() => {
    // console.log("BlogDetail component mounted, ID:", id);
    // console.log("API URL being used:", process.env.REACT_APP_BASE_URL || "https://swanbackend.onrender.com/api");
    
    if (error) {
      console.error("Error fetching blog:", error);
      // Add more detailed error info
      if (error.status === 404) {
        console.error("Blog not found - Verify the ID exists in the database");
      } else if (error.status >= 500) {
        console.error("Server error - Check backend logs");
      } else if (error.error) {
        console.error("Network error:", error.error);
      }
    }
    
    if (data) {
      console.log("Blog data loaded successfully:");
    }
  }, [id, data, error]);
  
  const [deleteBlog] = useDeleteBlogMutation();
  
  const handleEdit = () => {
    setOpenEditForm(true);
  };
  
  const handleCloseEditForm = (refresh) => {
    setOpenEditForm(false);
    if (refresh) {
      refetch();
    }
  };
  
  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      await deleteBlog(id).unwrap();
      navigate('/admin/blogs');
    } catch (error) {
      console.error('Failed to delete blog:', error);
    } finally {
      setOpenDeleteDialog(false);
    }
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!data || !data.blog) {
    return (
      <Box m="1.5rem 2.5rem">
        <Header title="Blog Not Found" subtitle="The requested blog could not be found" />
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (isLoggedIn) {
              navigate('/admin/blogs');
            } else {
              window.history.back();
            }
          }}
          sx={{ mt: 2 }}
        >
          Back
        </Button>
      </Box>
    );
  }
  
  const blog = data.blog;
  
  // Format the published date or created date
  const displayDate = blog && blog.published_date 
    ? formatDate(blog.published_date) 
    : blog && blog.created_at 
    ? formatDate(blog.created_at)
    : "Unknown date";
  
  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => {
            if (isLoggedIn) {
              navigate('/admin/blogs');
            } else {
              window.history.back();
            }
          }}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        {isLoggedIn && (
          <Box>
            <IconButton 
              onClick={handleEdit}
              sx={{ 
                color: theme.palette.secondary[300],
                backgroundColor: theme.palette.background.alt,
                marginRight: 1,
                '&:hover': {
                  backgroundColor: theme.palette.background.light,
                }
              }}
            >
              <EditIcon />
            </IconButton>
            
            <IconButton 
              onClick={handleDeleteClick}
              sx={{ 
                color: theme.palette.error.main,
                backgroundColor: theme.palette.background.alt,
                '&:hover': {
                  backgroundColor: theme.palette.background.light,
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </FlexBetween>
      
      <Container maxWidth="lg" disableGutters>
        {/* Blog Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: theme.palette.background.alt,
            borderRadius: '0.55rem',
          }}
        >
          {blog.is_featured && (
            <Chip
              icon={<FeaturedIcon />}
              label="Featured"
              color="warning"
              sx={{ mb: 2 }}
            />
          )}
          
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            {blog.title}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            color: theme.palette.text.primary,
          }}>
            <CalendarTodayOutlined sx={{ fontSize: '0.9rem', color: theme.palette.text.primary, mr: 0.5 }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {displayDate}
            </Typography>
            <Box sx={{ mx: 2 }}>•</Box>
            <VisibilityOutlined sx={{ fontSize: '0.9rem', color: theme.palette.text.primary, mr: 0.5 }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
              {blog.views || 0} views
            </Typography>
          </Box>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mb: 4,
              color: theme.palette.text.primary, 
              fontStyle: 'italic'
            }}
          >
            {blog.excerpt}
          </Typography>
          
          {blog.featured_image && (
            <Box 
              sx={{ 
                width: '100%', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                borderRadius: '0.55rem',
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.02)',
                maxHeight: '600px',
              }}
            >
              <Box
                component="img"
                src={blog.featured_image}
                alt={blog.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '600px',
                  objectFit: 'contain',
                  borderRadius: '0.55rem',
                }}
                onError={(e) => {
                  console.error('Error loading featured image:', blog.featured_image);
                  e.target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                }}
              />
            </Box>
          )}
          
          {/* Gallery Images Carousel */}
          {blog.gallery && blog.gallery.length > 0 && (
            (() => {
              console.log("Gallery data:", blog.gallery);
              
              // Use fallback component if there's any issue
              try {
                return (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Image Gallery</Typography>
                    <div className="carousel-wrapper">
                      <Carousel 
                        showArrows={true}
                        showStatus={false}
                        showThumbs={true}
                        infiniteLoop={true}
                        autoPlay={false}
                        swipeable={true}
                        emulateTouch={true}
                      >
                        {blog.gallery.map((image, index) => (
                          <div key={index}>
                            <img
                              src={image}
                              alt={`Gallery image ${index + 1}`}
                              style={{ 
                                maxHeight: '400px', 
                                objectFit: 'contain',
                                margin: '0 auto'
                              }}
                              onError={(e) => {
                                console.error('Error loading gallery image:', image);
                                e.target.src = 'https://via.placeholder.com/600x300?text=Image+Not+Available';
                              }}
                            />
                          </div>
                        ))}
                      </Carousel>
                    </div>
                  </Box>
                );
              } catch (error) {
                console.error("Error rendering carousel:", error);
                return (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Image Gallery</Typography>
                    <GalleryFallback images={blog.gallery} />
                  </Box>
                );
              }
            })()
          )}
        </Paper>
        
        {/* Blog Content */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            backgroundColor: theme.palette.background.alt,
            borderRadius: '0.55rem',
            mb: 4,
          }}
        >
          <Box 
            className="blog-content"
            sx={{ 
              mt: 4,
              typography: 'body1',
              '& p': { mb: 2, color: theme.palette.text.primary },
              '& h2': { 
                mt: 4, 
                mb: 2, 
                typography: 'h5',
                fontWeight: 600,
                color: theme.palette.text.primary
              },
              '& h3': { 
                mt: 3, 
                mb: 1.5, 
                typography: 'h6',
                fontWeight: 600,
                color: theme.palette.text.primary
              },
              '& ul, & ol': { 
                mb: 2,
                pl: 4,
                color: theme.palette.text.primary
              },
              '& li': { mb: 0.5 },
              '& a': { 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              },
              '& blockquote': {
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                pl: 2,
                py: 1,
                my: 2,
                color: theme.palette.text.primary,
                fontStyle: 'italic'
              },
              '& img': {
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                my: 3,
                borderRadius: 1
              },
              '& pre': {
                bgcolor: theme.palette.background.default,
                p: 2,
                borderRadius: 1,
                overflowX: 'auto',
                my: 2,
                color: theme.palette.text.primary
              },
              '& code': {
                fontFamily: 'monospace',
                bgcolor: theme.palette.background.paper,
                px: 0.5,
                borderRadius: 0.5,
                color: theme.palette.text.primary
              }
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {blog.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: theme.palette.secondary[300],
                    color: theme.palette.secondary[200],
                  }}
                />
              ))}
            </Box>
          )}
        </Paper>
        
        {/* Meta Information */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: theme.palette.background.alt,
            borderRadius: '0.55rem',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.secondary[300], mb: 1 }}
          >
            Status: <Chip 
              label={blog.status} 
              size="small" 
              color={blog.status === 'Published' ? 'success' : 'default'} 
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Typography
            variant="subtitle2"
            sx={{ color: theme.palette.secondary[300], mb: 1 }}
          >
            Created: {formatDate(blog.created_at)}
          </Typography>
          
          {blog.updated_at && (
            <Typography
              variant="subtitle2"
              sx={{ color: theme.palette.secondary[300] }}
            >
              Last Updated: {formatDate(blog.updated_at)}
            </Typography>
          )}
        </Paper>
      </Container>
      
      {/* Edit Form Dialog */}
      <BlogForm
        open={openEditForm}
        onClose={handleCloseEditForm}
        blog={blog}
        isEdit={true}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDeleteDialog}
        title="Delete Blog"
        content="Are you sure you want to delete this blog? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setOpenDeleteDialog(false)}
      />
    </Box>
  );
};

export default BlogDetail; 