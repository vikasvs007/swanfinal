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
  Divider,
  Pagination,
} from "@mui/material";
import {
  NewspaperOutlined as NewsIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  LocalOffer as TagIcon,
  BookmarkBorder as BookmarkIcon,
  BookmarkAdded as BookmarkFilledIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetBlogsQuery } from "state/api";
import { useNavigate } from "react-router-dom";
import BlogForm from "components/BlogForm";
import { formatImageUrl, formatDate } from "utils/helpers";

const News = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get API base URL from environment or fallback
  const apiBaseUrl = process.env.REACT_APP_BASE_URL?.replace('/api', '') || "https://swanbackend.onrender.com";
  
  // Only get News category posts and published status
  const { data, isLoading, refetch, error } = useGetBlogsQuery({
    category: "News",
    status: "Published",
    page: currentPage,
    limit: 6,
  });
  
  // Refetch data when component mounts
  React.useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [refetch]);
  
  // Log data for debugging
  React.useEffect(() => {
    console.log("News data:", data);
    if (error) {
      console.error("Error fetching news:", error);
    }
  }, [data, error]);
  
  // State for adding new news
  const [openForm, setOpenForm] = useState(false);
  
  const handleAddNews = () => {
    setOpenForm(true);
  };
  
  const handleCloseForm = (refresh) => {
    setOpenForm(false);
    if (refresh) {
      refetch();
    }
  };

  const handleViewBlog = (blog) => {
    // Use React Router navigation instead of window.open
    console.log("Navigating to blog from news:", blog._id);
    navigate(`/blogs/${blog._id}`);
    
    // Option to keep window.open for new tab if needed
    // const baseUrl = window.location.origin;
    // window.open(`${baseUrl}/blogs/${blog._id}`, '_blank');
  };

  // Handle pagination
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  
  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header 
          title="NEWS" 
          subtitle="Latest News and Updates"
          icon={
            <NewsIcon 
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
          onClick={handleAddNews}
          sx={{
            backgroundColor: theme.palette.secondary[300],
            color: theme.palette.background.alt,
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
          }}
        >
          Add News
        </Button>
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
              Error Loading News
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.secondary[300], mb: 3 }}>
              {error?.data?.message || error?.error || "Could not fetch news data. Please try again."}
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
            <NewsIcon sx={{ fontSize: 60, color: theme.palette.secondary[200], mb: 2 }} />
            <Typography variant="h5" sx={{ color: theme.palette.secondary[100], mb: 1 }}>
              No News Articles Found
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.secondary[300], mb: 3 }}>
              Get started by publishing your first news article
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNews}
            >
              Create News Article
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {data.blogs.map((news) => (
                <Grid item xs={12} sm={6} md={4} key={news._id}>
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
                    {news.is_featured && (
                      <Tooltip title="Featured News">
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
                    
                    <CardMedia
                      component="img"
                      height="160"
                      image={formatImageUrl(news.featured_image)}
                      alt={news.title}
                      onError={(e) => {
                        console.error('Image failed to load:', news.featured_image);
                        e.target.src = `https://source.unsplash.com/random/600x300/?news`;
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TimeIcon sx={{ color: theme.palette.primary.main, fontSize: '0.875rem' }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.secondary[300],
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(news.published_date || news.created_at)}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          color: theme.palette.secondary[100],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {news.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          color: theme.palette.secondary[300],
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {news.excerpt}
                      </Typography>
                      
                      {news.tags && news.tags.length > 0 && (
                        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {news.tags.slice(0, 3).map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                height: '20px', 
                                fontSize: '0.7rem',
                                borderColor: theme.palette.secondary[300],
                                color: theme.palette.secondary[200],
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mt: 2
                      }}>
                        <Button 
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={() => handleViewBlog(news)}
                          startIcon={<VisibilityIcon />}
                          sx={{ 
                            backgroundColor: theme.palette.secondary[300],
                            '&:hover': { 
                              backgroundColor: theme.palette.secondary.light 
                            }
                          }}
                        >
                          Read Full Article
                        </Button>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon 
                            sx={{ 
                              fontSize: '0.9rem', 
                              color: theme.palette.secondary[300],
                              mr: 0.5
                            }} 
                          />
                          <Typography variant="caption" sx={{ color: theme.palette.secondary[300] }}>
                            {news.views || 0}
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
      
      {/* Blog Form Dialog - for adding News */}
      <BlogForm 
        open={openForm}
        onClose={handleCloseForm}
        blog={{
          category: "News",
          status: "Draft",
        }}
        isEdit={false}
      />
    </Box>
  );
};

export default News; 