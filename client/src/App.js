import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { themeSettings } from "theme";
import { setToken } from "state";
import React from "react";

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
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const user = useSelector((state) => state.global.user);
  
  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  // Create theme with light mode only
  const theme = useMemo(() => createTheme(themeSettings()), []);
  const isLoggedIn = useSelector((state) => state.global.token);

  // Initialize token from localStorage if it exists
  const dispatch = useDispatch();
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken && !isLoggedIn) {
      dispatch(setToken(storedToken));
    }
  }, [dispatch, isLoggedIn]);

  console.log("Auth status:", isLoggedIn ? "Logged in" : "Not logged in");

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
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
