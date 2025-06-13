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
    // When user logs in, initialize the API token
    if (isAuth && token) {
      // In production, this token should be fetched from the server
      // after successful authentication, not hardcoded
      const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
      
      if (apiToken) {
        setApiToken(apiToken);
        // Only log in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log('API token initialized for authenticated user');
        }
      } else {
        console.warn('No API token available in environment');
      }
    } else if (!isAuth) {
      // When user logs out, clear the API token
      clearApiToken();
    }
  }, [isAuth, token]);

  // This is a utility component that doesn't render anything
  return null;
};

export default ApiTokenInitializer;
