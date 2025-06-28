// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBb4kINferntnAMoSf9lGtZvLAmp_IPog",
  authDomain: "swanlogin.firebaseapp.com",
  projectId: "swanlogin",
  storageBucket: "swanlogin.firebasestorage.app",
  messagingSenderId: "765235097263",
  appId: "1:765235097263:web:b33614ae31df7ec004ae5a",
  measurementId: "G-Y0W69NR7KZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally (avoid in development)
let analytics = null;

// Only initialize analytics in production or if supported
const initAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    }
  } catch (err) {
    // console.log('Firebase Analytics initialization failed:', err.message);
  }
};

// Don't block rendering with analytics initialization
initAnalytics();

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Track user presence and activity
const trackUserActivity = (userId, userName) => {
  if (analytics) {
    try {
      logEvent(analytics, 'user_active', {
        user_id: userId,
        user_name: userName,
        timestamp: new Date().toISOString()
      });
      console.log('User activity tracked successfully');
      return true;
    } catch (error) {
      console.error('Error tracking user activity:', error);
      return false;
    }
  }
  return false;
};

// Track page views
const trackPageView = (pageName, pageLocation) => {
  if (analytics) {
    try {
      logEvent(analytics, 'page_view', {
        page_name: pageName,
        page_location: pageLocation,
        timestamp: new Date().toISOString()
      });
      console.log(`Page view tracked: ${pageName}`);
      return true;
    } catch (error) {
      console.error('Error tracking page view:', error);
      return false;
    }
  }
  return false;
};

export { 
  app, 
  analytics, 
  auth, 
  googleProvider, 
  trackUserActivity,
  trackPageView
}; 