import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setApiToken, clearApiToken } from '../utils/authUtils';

/**
 * ApiTokenInitializer
 * 
 * A component that handles API token initialization when the app starts
 * and when a user logs in or out. This is important for API security.
 */
const ApiTokenInitializer = () => {
  const token = useSelector((state) => state.global?.token);
  const isAuth = useSelector((state) => state.global?.isAuth);

  useEffect(() => {
    const initializeToken = async () => {
      try {
        // When user logs in, initialize the API token
        if (isAuth && token) {
          // In production, this token should be fetched from the server
          // after successful authentication, not hardcoded
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          
          if (apiToken) {
            setApiToken(apiToken);
            // Log in both development and production for debugging
            console.log('[API Token] Initialized for authenticated user');
            
            // Verify token was set correctly
            const storedToken = localStorage.getItem('apiToken');
            if (storedToken !== apiToken) {
              console.warn('[API Token] Token verification failed - stored token does not match');
            }
          } else {
            console.error('[API Token] No API token available in environment');
            // Optionally redirect to error page or show error message
          }
        } else if (!isAuth) {
          // When user logs out, clear the API token
          clearApiToken();
          console.log('[API Token] Cleared on logout');
        }
      } catch (error) {
        console.error('[API Token] Error during initialization:', error);
        // Optionally show error to user or redirect to error page
      }
    };

    initializeToken();
  }, [isAuth, token]);

  // This is a utility component that doesn't render anything
  return null;
};

export default ApiTokenInitializer;
