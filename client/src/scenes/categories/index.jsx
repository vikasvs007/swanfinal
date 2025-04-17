import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  Typography,
  CircularProgress,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import Header from "components/Header";
import { useGetBlogCategoriesQuery } from "state/api";

const Categories = () => {
  const theme = useTheme();
  const { data, isLoading, error, refetch } = useGetBlogCategoriesQuery();
  const [categories, setCategories] = useState([]);

  // Refetch data on component mount
  React.useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [refetch]);

  // Add debugging
  React.useEffect(() => {
    console.log("Categories data:", data);
    if (error) {
      console.error("Error fetching categories:", error);
    }
  }, [data, error]);

  useEffect(() => {
    if (data) {
      // Transform the category data into a more usable format
      const transformedCategories = data.map(category => ({
        name: category._id,
        count: category.count,
      }));
      
      // Sort categories by count in descending order
      transformedCategories.sort((a, b) => b.count - a.count);
      
      setCategories(transformedCategories);
    }
  }, [data]);

  // Get a color for the category based on its name
  const getCategoryColor = (categoryName) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
    ];
    
    // Hash the category name to get a consistent color
    const hash = categoryName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header 
          title="CATEGORIES" 
          subtitle="Manage Blog Categories"
          icon={
            <CategoryIcon 
              sx={{ 
                fontSize: '2rem',
                color: theme.palette.secondary[300]
              }} 
            />
          }
        />
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
              Error Loading Categories
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.secondary[300], mb: 3 }}>
              {error?.data?.message || error?.error || "Could not fetch category data. Please try again."}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </Box>
        ) : !categories || categories.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              backgroundColor: theme.palette.background.alt,
              borderRadius: '10px',
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <CategoryIcon sx={{ fontSize: 60, color: theme.palette.secondary[200], mb: 2 }} />
            <Typography variant="h5" sx={{ color: theme.palette.secondary[100], mb: 1 }}>
              No Categories Found
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.secondary[300], mb: 3 }}>
              Categories will appear here when you create blog posts with different categories.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ArticleIcon />}
              onClick={() => {
                // Navigate to blog creation
                window.location.href = '/blogs';
              }}
            >
              Create Blog Post
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Category Overview Card */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  backgroundColor: theme.palette.background.alt,
                  borderRadius: "0.55rem",
                  height: "100%",
                  boxShadow: theme.shadows[2],
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 'bold',
                      color: theme.palette.secondary[100],
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CategoryIcon color="primary" /> Category Overview
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: theme.palette.secondary[100],
                        mb: 1
                      }}
                    >
                      {categories.length}
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.secondary[300] }}>
                      Total Categories
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mb: 2,
                      color: theme.palette.secondary[200]
                    }}
                  >
                    Categories help organize your blog content and make it easier for users to find related articles.
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 1,
                      color: theme.palette.secondary[300],
                      fontWeight: 'bold'
                    }}
                  >
                    Category Distribution
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    justifyContent: 'space-between' 
                  }}>
                    {categories.slice(0, 5).map(category => (
                      <Box 
                        key={category.name}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center',
                          p: 1,
                          borderRadius: '8px',
                          width: 'calc(33% - 8px)',
                          mb: 1
                        }}
                      >
                        <Badge 
                          badgeContent={category.count} 
                          color="primary"
                          sx={{ mb: 1 }}
                        >
                          <Box 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              backgroundColor: getCategoryColor(category.name),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                            }}
                          >
                            {category.name.charAt(0)}
                          </Box>
                        </Badge>
                        <Typography 
                          variant="caption"
                          sx={{ 
                            color: theme.palette.secondary[200],
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%'
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Categories List Card */}
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  backgroundColor: theme.palette.background.alt,
                  borderRadius: "0.55rem",
                  height: "100%",
                  boxShadow: theme.shadows[2],
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 'bold',
                      color: theme.palette.secondary[100],
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <ArticleIcon color="primary" /> Blog Categories
                  </Typography>
                  
                  <List sx={{ width: '100%' }}>
                    {categories.map((category, index) => (
                      <React.Fragment key={category.name}>
                        <ListItem
                          alignItems="center"
                          sx={{ 
                            py: 1.5,
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover
                            }
                          }}
                          secondaryAction={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Badge 
                                badgeContent={category.count} 
                                color="primary"
                                sx={{ 
                                  '& .MuiBadge-badge': {
                                    fontSize: '0.75rem',
                                    height: '20px',
                                    minWidth: '20px'
                                  }
                                }}
                              >
                                <ArticleIcon sx={{ color: theme.palette.secondary[200] }} />
                              </Badge>
                              <Tooltip title="View Blogs">
                                <IconButton 
                                  edge="end"
                                  onClick={() => {
                                    // Navigate to filtered blog list
                                    window.location.href = `/blogs?category=${category.name}`;
                                  }}
                                  sx={{ ml: 1 }}
                                >
                                  <CategoryIcon sx={{ color: getCategoryColor(category.name) }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                        >
                          <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%', 
                            backgroundColor: getCategoryColor(category.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            mr: 2
                          }}>
                            {category.name.charAt(0)}
                          </Box>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ color: theme.palette.secondary[100] }}>
                                {category.name}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ color: theme.palette.secondary[300] }}>
                                {category.count} {category.count === 1 ? 'blog' : 'blogs'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < categories.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Categories; 