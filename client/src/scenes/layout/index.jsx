import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "components/Navbar";
import Sidebar from "components/Sidebar";
import { useGetUserQuery } from "state/api";
import { setUser } from "state";
import analyticsService from "services/firebaseAnalytics";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.global.userId);
  const { data: userData, isLoading } = useGetUserQuery(userId);
  const location = useLocation();

  useEffect(() => {
    if (userData) {
      console.log("Setting user data:", userData);
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);

  // Track page views whenever location changes
  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'dashboard';
    analyticsService.trackNavigation(pageName);
  }, [location]);

  if (isLoading) return null;

  return (
    <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%">
      <Sidebar
        user={userData || {}}
        isNonMobile={isNonMobile}
        drawerWidth="250px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box flexGrow={1}>
        <Navbar
          user={userData || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
