import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import { setToken } from "state";
import React from "react";
import { initializeSecureStorage } from './utils/cleanStorage';
import { isAuthenticated, getCurrentUser } from './utils/auth';
import ApiTokenInitializer from './components/ApiTokenInitializer';
import { setApiToken } from './utils/authUtils';

import Layout from "scenes/layout";
import Dashboard from "scenes/dashboard";
import Products from "scenes/products";
import Geography from "scenes/geography";
import Login from "scenes/login";
import Users from "scenes/users";
import Orders from "scenes/orders";
import Enquiries from "scenes/enquiries";
import Notifications from "scenes/notifications";
import ActiveUsers from "scenes/activeUsers";
import Profile from "scenes/profile";
import Visitors from "scenes/visitors";
import UserStatistics from "scenes/userStatistics";
import VisitorDetails from "scenes/visitorDetails";
import Blogs from "scenes/blogs";
import BlogDetail from "scenes/blogs/BlogDetail";
import News from "scenes/news";
import Categories from "scenes/categories";
import Cards from "scenes/cards";
import NotFound from "scenes/NotFound";

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = isAuthenticated();
  const user = useSelector((state) => state.global.user);
  
  if (!isLoggedIn && !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  // Create theme with light mode only
  const theme = useMemo(() => createTheme(themeSettings()), []);
  const isLoggedIn = useSelector((state) => state.global.token);
  const [authChecked, setAuthChecked] = useState(false);

  // Initialize token from secure cookies if user is authenticated
  const dispatch = useDispatch();
  useEffect(() => {
    // Initialize secure storage and clean up any insecure tokens
    initializeSecureStorage();

    // Check authentication status securely
    const checkAuthStatus = async () => {
      try {
        if (isAuthenticated()) {
          const userData = await getCurrentUser();
          if (userData && userData.user) {
            dispatch(setToken("secure-cookie-auth")); // Token is now in HttpOnly cookie
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
      }
      setAuthChecked(true);
    };

    checkAuthStatus();
  }, [dispatch]);

  console.log("Auth status:", isLoggedIn ? "Logged in" : "Not logged in");

  // Wait for auth check before rendering to prevent flashes of login screen
  if (!authChecked && !isLoggedIn) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {/* Initialize API token security */}
          <ApiTokenInitializer />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
            } />
            
            {/* Blog Detail Public Route */}
            <Route path="/blogs/:id" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <BlogDetail />
              </React.Suspense>
            } />
            
            {/* Added blog route with trailing slash to handle both cases */}
            <Route path="/blogs/:id/" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <BlogDetail />
              </React.Suspense>
            } />
            
            {/* Protected Routes */}
            <Route 
              element={
                isLoggedIn ? <Layout /> : <Navigate to="/login" replace />
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/geography" element={<Geography />} />
              <Route path="/users" element={<Users />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/active-users" element={<ActiveUsers />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/visitors/:id" element={<VisitorDetails />} />
              <Route path="/user-statistics" element={<UserStatistics />} />
              <Route path="/admin/blogs" element={<Blogs />} />
              <Route path="/admin/news" element={<News />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/cards" element={<Cards />} />
            </Route>
            
            {/* Fallback route - redirect to NotFound or login */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
