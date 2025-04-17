import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "components/Header";
import {
  useGetProductsQuery,
  useGetOrdersQuery,
  useGetEnquiriesQuery,
  useGetUserStatisticsQuery,
  useGetActiveUsersQuery,
  useGetVisitorsQuery,
  useGetVisitorStatsQuery,
  useGetCardsQuery,
  useGetNotificationsQuery,
  useGetActiveUserStatsQuery,

} from "state/api";
import StatBox from "components/StatBox";
import {
  Inventory2Outlined,
  ShoppingCartOutlined,
  PersonAdd,
  Traffic,
  QueryBuilder,
  PersonOutlined,
  RefreshOutlined,
  Public as PublicIcon,
  AccessTimeOutlined,
  PeopleOutlined,
  BarChart,
  ViewCarousel as CardIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import analyticsService from "services/firebaseAnalytics";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

const Dashboard = () => {
  const theme = useTheme();
  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
  const navigate = useNavigate();
  
  const { data: products, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: orders, isLoading: isLoadingOrders } = useGetOrdersQuery();
  const { data: enquiries, isLoading: isLoadingEnquiries } = useGetEnquiriesQuery();
  const { data: notifications } = useGetNotificationsQuery();
  const { data: userStats, isLoading: isLoadingStats } = useGetUserStatisticsQuery();
  const { data: backendActiveUsers, isLoading: isLoadingBackendActiveUsers } = useGetActiveUsersQuery();
  const { data: visitors } = useGetVisitorsQuery();
  const { data: visitorStats } = useGetVisitorStatsQuery();
  const { data: cards, isLoading: isLoadingCards } = useGetCardsQuery();
  const { data: activeUserStats, isLoading: isLoadingActiveStats } = useGetActiveUserStatsQuery();
  
  // Get total visitor count from the stats data
  const totalVisitorsCount = visitorStats?.totalVisitors || visitors?.visitors?.length || 0;
  
  // State to manage Firebase active users
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // User activity historical data state
  const [userActivityData, setUserActivityData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    trend: [] // Store the trend data for the graph
  });
  
  // Initialize and fetch Firebase analytics data
  useEffect(() => {
    fetchFirebaseUsers();
    
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      fetchFirebaseUsers();
      setLastRefreshed(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Process the user statistics when API data changes
  useEffect(() => {
    if (activeUserStats && userStats) {
      // Get historical data from the backend
      const dailyActiveCount = firebaseUsers.length || 0;
      const weeklyActiveCount = activeUserStats?.onlineUsers || 0;
      const monthlyActiveCount = activeUserStats?.totalActive || 0;
      
      // Generate trend data - for simplicity using placeholder data initially
      // In a real scenario, we would get this from a historical API endpoint
      const currentDate = new Date();
      const trendData = generateTrendData(currentDate, dailyActiveCount);
      
      setUserActivityData({
        daily: dailyActiveCount,
        weekly: weeklyActiveCount,
        monthly: monthlyActiveCount,
        trend: trendData
      });
    }
  }, [activeUserStats, userStats, firebaseUsers]);
  
  // Generate trend data for the graph
  const generateTrendData = (currentDate, currentValue) => {
    // This is a placeholder function that would normally be replaced with real API data
    // In a production app, you would fetch this data from your backend API
    
    const data = [];
    const numDays = 28; // 4 weeks of data
    
    // Generate some realistic-looking trend data
    for (let i = 0; i < numDays; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (numDays - i));
      
      // Create a realistic trend that leads to current value
      // For simplicity, we're using a simple algorithm to generate data
      // In real usage, this would come from your analytics database
      let value;
      if (i < numDays - 7) {
        // Older data (3-4 weeks ago)
        value = Math.max(0, Math.floor(currentValue * 0.6 + Math.random() * 2 - 1));
      } else if (i < numDays - 2) {
        // Recent data (1-2 weeks ago)
        value = Math.max(0, Math.floor(currentValue * 0.8 + Math.random() * 2 - 0.5));
      } else {
        // Latest data
        value = Math.max(0, Math.floor(currentValue * 0.9 + Math.random() * 2));
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value
      });
    }
    
    return data;
  };
  
  const fetchFirebaseUsers = () => {
    setIsLoadingFirebase(true);
    
    try {
      // Get active users from our analytics service
      const activeUsers = analyticsService.getActiveUsers();
      setFirebaseUsers(activeUsers);
    } catch (error) {
      console.error('Error fetching Firebase active users:', error);
    } finally {
      setIsLoadingFirebase(false);
    }
  };
  
  // Calculate total active users (Firebase + Backend)
  const totalActiveUsers = (backendActiveUsers?.activeUsers?.length || 0) + firebaseUsers.length;
  
  // Manual refresh handler
  const handleRefresh = () => {
    fetchFirebaseUsers();
    setLastRefreshed(new Date());
  };
  
  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };
  
  // Calculate session duration in minutes
  const calculateSessionDuration = (start, last) => {
    if (!start || !last) return 0;
    const startTime = new Date(start).getTime();
    const lastTime = new Date(last).getTime();
    return Math.floor((lastTime - startTime) / (1000 * 60)); // minutes
  };

  const recentOrders = orders?.slice(-5).reverse() || [];
  const recentEnquiries = enquiries?.slice(-5).reverse() || [];

  const dashboardStats = [
    {
      title: "Total Products",
      value: products?.length || 0,
      icon: <Inventory2Outlined sx={{ color: theme.palette.secondary[300], fontSize: "26px" }} />,
      description: "Total products in inventory",
    },
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: <ShoppingCartOutlined sx={{ color: theme.palette.secondary[300], fontSize: "26px" }} />,
      description: "Total orders received",
    },
    {
      title: "Active Users",
      value: totalActiveUsers,
      icon: <PersonAdd sx={{ color: theme.palette.secondary[300], fontSize: "26px" }} />,
      description: "Real-time active users",
    },
    {
      title: "Total Visitors",
      value: totalVisitorsCount,
      icon: <QueryBuilder sx={{ color: theme.palette.secondary[300], fontSize: "26px" }} />,
      description: "Total unique visitors",
    },
  ];

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />

      <Box mt="20px">
        <Grid container spacing={2}>
          {dashboardStats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatBox
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                description={stat.description}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Firebase Analytics Active Users Section */}
      <Box mt="2rem">
        <Card sx={{ bgcolor: theme.palette.background.alt, mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <PeopleOutlined sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color={theme.palette.secondary[100]}>
                  Real-Time Active Users
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Typography variant="caption" color={theme.palette.secondary[300]} mr={1}>
                  Last updated: {formatTimeAgo(lastRefreshed)}
                </Typography>
                <Tooltip title="Refresh data">
                  <IconButton onClick={handleRefresh} size="small">
                    <RefreshOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            {isLoadingFirebase ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress size={24} />
              </Box>
            ) : firebaseUsers.length === 0 ? (
              <Typography color={theme.palette.secondary[300]} textAlign="center" p={2}>
                No users currently active
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {/* User Activity Summary */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: theme.palette.primary.light }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>User Activity</Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Total Active Users:</Typography>
                        <Typography variant="body2" fontWeight="bold">{totalActiveUsers}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Users:</Typography>
                        <Typography variant="body2" fontWeight="bold">{firebaseUsers.length}</Typography>
                      </Box>
                      {/* <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2">Backend Users:</Typography>
                        <Typography variant="body2" fontWeight="bold">{backendActiveUsers?.activeUsers?.length || 0}</Typography>
                      </Box> */}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Active User Visual Representation */}
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{ 
                      width: '100%',
                      height: 300,
                      bgcolor: theme.palette.background.alt,
                      borderRadius: 1,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleOutlined sx={{ color: theme.palette.primary.main, mr: 1 }} />
                      <Typography variant="h6">
                        User Activity
                      </Typography>
                    </Box>
                    
                    {firebaseUsers.length > 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        height: '100%',
                        justifyContent: 'center'
                      }}>
                        {/* Visual representation of online vs away users with people icons */}
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          mb: 3
                        }}>
                          <Box sx={{ 
                            width: '100%',
                            height: 120,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            gap: 1,
                            mb: 1
                          }}>
                            {/* Online users column */}
                            <Box sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              width: 120
                            }}>
                              <Box sx={{ 
                                p: 1,
                                borderRadius: 2,
                                bgcolor: 'rgba(46, 204, 113, 0.15)',
                                border: `1px solid ${theme.palette.success.main}`,
                                width: '100%',
                                minHeight: 40,
                                display: 'flex',
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="h4" color={theme.palette.success.main} fontWeight="bold">
                                  {firebaseUsers.filter(user => user.isOnline).length}
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '50%', 
                                  bgcolor: theme.palette.success.main,
                                  mr: 1 
                                }} />
                                <Box sx={{ 
                                  bgcolor: theme.palette.success.main,
                                  p: 0.5, 
                                  borderRadius: 1,
                                  display: 'flex'
                                }}>
                                  <PersonOutlined sx={{ color: '#fff', fontSize: 20 }} />
                                </Box>
                              </Box>
                            </Box>

                            {/* Away users column */}
                            <Box sx={{ 
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              width: 120
                            }}>
                              <Box sx={{ 
                                p: 1,
                                borderRadius: 2,
                                bgcolor: 'rgba(241, 196, 15, 0.15)',
                                border: `1px solid ${theme.palette.warning.main}`,
                                width: '100%',
                                minHeight: 40,
                                display: 'flex',
                                alignItems: 'center', 
                                justifyContent: 'center',
                                flexDirection: 'column'
                              }}>
                                <Typography variant="h4" color={theme.palette.warning.main} fontWeight="bold">
                                  {firebaseUsers.filter(user => !user.isOnline).length}
                                </Typography>
                              </Box>
                              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                <Box sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '50%', 
                                  bgcolor: theme.palette.warning.main,
                                  mr: 1 
                                }} />
                                <Box sx={{ 
                                  bgcolor: theme.palette.warning.main,
                                  p: 0.5, 
                                  borderRadius: 1,
                                  display: 'flex'
                                }}>
                                  <PersonOutlined sx={{ color: '#fff', fontSize: 20 }} />
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        {/* User icons grid */}
                        <Box sx={{ 
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          gap: 2,
                          px: 2
                        }}>
                          {firebaseUsers.map((user, index) => (
                            <Box
                              key={user.id || index}
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative'
                              }}
                            >
                              <Box sx={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: '50%',
                                bgcolor: user.isOnline ? theme.palette.success.light : theme.palette.warning.light,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 0 2px ${user.isOnline ? theme.palette.success.main : theme.palette.warning.main}`
                              }}>
                                <PersonOutlined sx={{ color: user.isOnline ? theme.palette.success.dark : theme.palette.warning.dark }} />
                              </Box>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: -4,
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  bgcolor: user.isOnline ? theme.palette.success.main : theme.palette.warning.main,
                                  border: `2px solid ${theme.palette.background.alt}`
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%'
                      }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <PeopleOutlined sx={{ fontSize: 48, color: theme.palette.secondary[300], mb: 1 }} />
                          <Typography variant="body1" color="text.secondary">
                            No active users
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box mt="2rem">
        <Grid container spacing={2}>
          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: theme.palette.background.alt }}>
              <CardContent>
                <Typography variant="h6" color={theme.palette.secondary[100]} gutterBottom>
                  Recent Orders
                </Typography>
                {isLoadingOrders ? (
                  <CircularProgress />
                ) : (
                  <Box>
                    {recentOrders.map((order) => (
                      <Box
                        key={order._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: theme.palette.primary.light,
                        }}
                      >
                        <Box>
                          <Typography color={theme.palette.secondary[100]}>
                            {order.user_id?.name || "Unknown Customer"}
                          </Typography>
                          <Typography variant="caption" color={theme.palette.secondary[300]}>
                            {order.products.map(p => `${p.product_id?.name || 'Product'} (${p.quantity})`).join(', ')}
                          </Typography>
                        </Box>
                        <Box>
                          <Chip
                            label={order.status}
                            color={
                              order.status === "delivered"
                                ? "success"
                                : order.status === "shipped"
                                ? "primary"
                                : "warning"
                            }
                            size="small"
                          />
                          <Typography variant="caption" color={theme.palette.secondary[300]} sx={{ display: 'block' }}>
                            ₹{order.total_amount.toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Enquiries */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: theme.palette.background.alt }}>
              <CardContent>
                <Typography variant="h6" color={theme.palette.secondary[100]} gutterBottom>
                  Recent Enquiries
                </Typography>
                {isLoadingEnquiries ? (
                  <CircularProgress />
                ) : (
                  <Box>
                    {recentEnquiries.map((enquiry) => (
                      <Box
                        key={enquiry._id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: theme.palette.primary.light,
                        }}
                      >
                        <Box>
                          <Typography color={theme.palette.secondary[100]}>
                            {enquiry.user_id?.name || "Unknown User"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={theme.palette.secondary[300]}
                            sx={{
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '300px'
                            }}
                          >
                            {enquiry.message}
                          </Typography>
                        </Box>
                        <Box>
                          <Chip
                            label={enquiry.status}
                            color={enquiry.status === "closed" ? "error" : "success"}
                            size="small"
                          />
                          <Typography variant="caption" color={theme.palette.secondary[300]} sx={{ display: 'block' }}>
                            {new Date(enquiry.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* User Activity Over Time Graph */}
      <Box mt="2rem">
        <Card sx={{ bgcolor: theme.palette.background.alt }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <BarChart sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color={theme.palette.secondary[100]}>
                  Daily Active User Trends
                </Typography>
              </Box>
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} disabled={isLoadingFirebase || isLoadingActiveStats}>
                  {isLoadingFirebase || isLoadingActiveStats ? (
                    <CircularProgress size={24} />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            
            <Grid container spacing={2}>
              {/* Time-Series Chart Area */}
              <Grid item xs={12} md={9}>
                <Box
                  sx={{ 
                    height: 240,
                    position: 'relative',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    p: 1,
                    overflow: 'hidden'
                  }}
                >
                  {/* User Count Axis (Y-axis) */}
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: 30,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      pr: 1,
                      pt: 1,
                      pb: 3
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">4</Typography>
                    <Typography variant="caption" color="text.secondary">3</Typography>
                    <Typography variant="caption" color="text.secondary">2</Typography>
                    <Typography variant="caption" color="text.secondary">1</Typography>
                    <Typography variant="caption" color="text.secondary">0</Typography>
                  </Box>
                  
                  {/* Chart Visualization Area */}
                  <Box 
                    sx={{ 
                      ml: 4,
                      height: '100%',
                      position: 'relative',
                      pt: 1
                    }}
                  >
                    {/* Chart Grid Lines */}
                    <Box sx={{ 
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      pb: 3
                    }}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Box 
                          key={i}
                          sx={{ 
                            width: '100%', 
                            height: '1px', 
                            bgcolor: theme.palette.divider
                          }}
                        />
                      ))}
                    </Box>
                    
                    {/* Date Timeline (X-axis) */}
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        px: 2
                      }}
                    >
                      {userActivityData.trend.length > 0 && (
                        <>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(userActivityData.trend[0].date).getDate()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(userActivityData.trend[0].date).toLocaleString('default', { month: 'short' })}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(userActivityData.trend[Math.floor(userActivityData.trend.length / 3)].date).getDate()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(userActivityData.trend[Math.floor(userActivityData.trend.length * 2 / 3)].date).getDate()}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(userActivityData.trend[userActivityData.trend.length - 1].date).getDate()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(userActivityData.trend[userActivityData.trend.length - 1].date).toLocaleString('default', { month: 'short' })}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                    
                    {/* User Activity Data Visualization */}
                    <Box sx={{ 
                      position: 'relative', 
                      height: 'calc(100% - 24px)',
                      width: '100%'
                    }}>
                      {/* Monthly Active Users (30-day) Trend Line */}
                      {userActivityData.trend.length > 0 && (
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'flex-end'
                        }}>
                          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1a73e8" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#1a73e8" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path
                              d={`M${0},${170 - (userActivityData.trend[0].value * 40)}
                                ${userActivityData.trend.map((point, i) => {
                                  const x = (i / (userActivityData.trend.length - 1)) * 100;
                                  const y = 170 - (point.value * 40);
                                  return `L${x},${y}`;
                                }).join(' ')}
                              `}
                              fill="none"
                              stroke="#1a73e8"
                              strokeWidth="2"
                            />
                            <path
                              d={`M${0},${170 - (userActivityData.trend[0].value * 40)}
                                ${userActivityData.trend.map((point, i) => {
                                  const x = (i / (userActivityData.trend.length - 1)) * 100;
                                  const y = 170 - (point.value * 40);
                                  return `L${x},${y}`;
                                }).join(' ')}
                                L${100},${170} L${0},${170} Z
                              `}
                              fill="url(#monthlyGradient)"
                              opacity="0.3"
                            />
                            <circle
                              cx="100"
                              cy={170 - (userActivityData.monthly * 40)}
                              r="4"
                              fill="#1a73e8"
                            />
                          </svg>
                        </Box>
                      )}
                      
                      {/* Weekly Active Users (7-day) Trend Line */}
                      {userActivityData.trend.length > 0 && (
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'flex-end'
                        }}>
                          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <path
                              d={`M${userActivityData.trend.length - 8},${170 - (userActivityData.trend[userActivityData.trend.length - 8].value * 40)}
                                ${userActivityData.trend.slice(-7).map((point, i) => {
                                  const x = ((userActivityData.trend.length - 7 + i) / (userActivityData.trend.length - 1)) * 100;
                                  const y = 170 - (point.value * 40);
                                  return `L${x},${y}`;
                                }).join(' ')}
                              `}
                              fill="none"
                              stroke="#4747EB"
                              strokeWidth="2"
                              strokeDasharray="4 2"
                            />
                            <circle
                              cx="100"
                              cy={170 - (userActivityData.weekly * 40)}
                              r="4"
                              fill="#4747EB"
                            />
                          </svg>
                        </Box>
                      )}
                      
                      {/* Daily Active Users (1-day) Point */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        height: '100%',
                      }}>
                        <svg width="30" height="100%" style={{ overflow: 'visible' }}>
                          <circle
                            cx="15"
                            cy={170 - (userActivityData.daily * 40)}
                            r="6"
                            fill="#720796"
                            stroke="white"
                            strokeWidth="1"
                          />
                          <line
                            x1="15"
                            y1={170 - (userActivityData.daily * 40)}
                            x2="15"
                            y2="170"
                            stroke="#720796"
                            strokeWidth="2"
                            strokeDasharray="3 2"
                          />
                        </svg>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              {/* Metrics Legend and Data Summary */}
              <Grid item xs={12} md={3}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 1.5,
                  height: '100%',
                  justifyContent: 'center'
                }}>
                  {/* Monthly Active Users Indicator */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: '#1a73e8',
                    bgcolor: 'rgba(26, 115, 232, 0.05)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': { bgcolor: 'rgba(26, 115, 232, 0.1)' },
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ 
                          width: 18, 
                          height: 18, 
                          bgcolor: '#1a73e8',
                          mr: 1,
                          borderRadius: 0.5
                        }} />
                        <Typography variant="body2" fontWeight="medium">Monthly Active Users</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                        Users active in the last 30 days
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      bgcolor: '#1a73e8',
                      color: 'white',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      minWidth: 32,
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(26, 115, 232, 0.3)'
                    }}>
                      <Typography variant="body2" fontWeight="bold" fontSize="1.1rem">
                        {isLoadingActiveStats ? "..." : userActivityData.monthly}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Weekly Active Users Indicator */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: '#4747EB',
                    bgcolor: 'rgba(71, 71, 235, 0.05)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': { bgcolor: 'rgba(71, 71, 235, 0.1)' },
                    mb: 1
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ 
                          width: 18, 
                          height: 18, 
                          bgcolor: '#4747EB',
                          mr: 1,
                          borderRadius: 0.5
                        }} />
                        <Typography variant="body2" fontWeight="medium">Weekly Active Users</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                        Users active in the last 7 days
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      bgcolor: '#4747EB',
                      color: 'white',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      minWidth: 32,
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(71, 71, 235, 0.3)'
                    }}>
                      <Typography variant="body2" fontWeight="bold" fontSize="1.1rem">
                        {isLoadingActiveStats ? "..." : userActivityData.weekly}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Daily Active Users Indicator */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: '#720796',
                    bgcolor: 'rgba(114, 7, 150, 0.05)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': { bgcolor: 'rgba(114, 7, 150, 0.1)' }
                  }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Box sx={{ 
                          width: 18, 
                          height: 18, 
                          bgcolor: '#720796',
                          mr: 1,
                          borderRadius: 0.5
                        }} />
                        <Typography variant="body2" fontWeight="medium">Daily Active Users</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5 }}>
                        Users active in the last 24 hours
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      bgcolor: '#720796',
                      color: 'white',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      minWidth: 32,
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(114, 7, 150, 0.3)'
                    }}>
                      <Typography variant="body2" fontWeight="bold" fontSize="1.1rem">
                        {isLoadingFirebase ? "..." : userActivityData.daily}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Promotional Cards Section */}
      <Box mt="2rem">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            <CardIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: 24 }} />
            <Typography variant="h6" color={theme.palette.secondary[100]}>
              Promotional Cards
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => navigate("/cards")}
          >
            Manage Cards
          </Button>
        </Box>
        
        {isLoadingCards ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress size={24} />
          </Box>
        ) : !cards || cards.length === 0 ? (
          <Typography color={theme.palette.secondary[300]} textAlign="center" p={2}>
            No promotional cards created yet
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {cards.slice(0, 3).map((card) => (
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
                    height="160"
                    image={card.image}
                    alt={card.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" color={theme.palette.secondary[100]}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color={theme.palette.secondary[300]}>
                      {card.message.length > 100 ? `${card.message.substring(0, 100)}...` : card.message}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {cards.length > 3 && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" mt={1}>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => navigate("/cards")}
                  >
                    View All Cards
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
