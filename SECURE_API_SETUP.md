# Secure API Implementation Guide

This document explains how our application securely handles API requests to prevent exposure of sensitive API tokens and endpoints in the browser's network tab.

## Problem

When making API requests directly from the client-side (browser), several security issues arise:

1. API tokens stored in localStorage or sent in request headers are visible in the browser's network tab
2. External API endpoints are exposed, making them vulnerable to unauthorized access
3. Anyone with browser dev tools can extract these tokens and use them elsewhere

## Solution: Server-Side Proxy with Secure Authentication

Our implementation uses a server-side proxy pattern with HttpOnly cookies that keeps all sensitive information on the server:

1. **Client-Side**: The frontend makes requests to our own backend proxy routes without sending any API tokens
2. **Server-Side**: Our backend proxy receives these requests, adds the necessary API tokens, and forwards them to the external API
3. **Response**: The backend proxy receives the response from the external API and forwards it back to the client
4. **Authentication**: User authentication is handled with HttpOnly cookies that are not accessible via JavaScript

## Implementation

### Server-Side Setup

1. `apiProxy.js` middleware: Handles forwarding requests to the external API with proper authentication
2. `apiCache.js` middleware: Adds response caching to improve performance
3. `rateLimit.js` middleware: Prevents abuse through rate limiting
4. `auth.js` middleware: Handles secure authentication using HttpOnly cookies
5. Environment variables: All API tokens and external API URLs are stored in server-side environment variables
6. `validateEnv.js`: Validates required environment variables are properly set

### Client-Side Setup

1. `apiClient.js`: A utility that makes requests to our proxy endpoints using credentials mode
2. `auth.js`: Authentication utility that uses secure HttpOnly cookies instead of localStorage
3. `apiMigration.js`: Helps migrate existing code to use the secure approach
4. `cleanStorage.js`: Utility to clean up any existing insecure tokens from localStorage and sessionStorage

## Security Benefits

1. **No Token Exposure**: Authentication tokens are stored in HttpOnly cookies that are not accessible via JavaScript
2. **No API Tokens in Browser**: External API tokens never leave the server
3. **Endpoint Obfuscation**: External API endpoints are not visible to client-side code
4. **CSRF Protection**: Cookies are set with SameSite=Strict to prevent cross-site request forgery
5. **Rate Limiting**: Prevents abuse and potential DDoS attacks
6. **Automatic Token Cleanup**: Any existing insecure tokens are automatically removed from storage

## Usage

### Authentication

```javascript
import auth from '../utils/auth';

// Login
const handleLogin = async (email, password) => {
  try {
    const response = await auth.login({ email, password });
    // User is now logged in with a secure HttpOnly cookie
    // No need to store token in localStorage
    return response.user;
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Check if user is authenticated
const isUserLoggedIn = auth.isAuthenticated();

// Get user profile
const getUserProfile = async () => {
  try {
    const { user } = await auth.getCurrentUser();
    return user;
  } catch (error) {
    console.error('Failed to get user profile:', error);
  }
};

// Logout
const handleLogout = async () => {
  await auth.logout();
  // User is now logged out and cookie is cleared
};
```

### API Requests

Instead of making direct API calls:

```javascript
// DON'T DO THIS - insecure
const apiToken = localStorage.getItem('apiToken');
fetch('https://external-api.com/data', {
  headers: {
    'Authorization': `Bearer ${apiToken}`
  }
});
```

Use our secure API client:

```javascript
// DO THIS - secure
import api from '../utils/apiClient';

// The token is added server-side
api.request('get', '/data');
```

## Migration Guide

To migrate existing code to use the secure API client:

1. Run the storage cleanup utility to remove insecure tokens:
   ```javascript
   import { cleanAllStorage } from '../utils/cleanStorage';
   cleanAllStorage();
   ```

2. Update your authentication logic to use the new auth utility:
   ```javascript
   import auth from '../utils/auth';
   
   // Instead of storing tokens in localStorage
   const user = await auth.login(credentials);
   ```

3. Replace direct API calls with the secure API client:
   ```javascript
   // Before:
   fetch('/api/users')
     .then(res => res.json())
     .then(data => setUsers(data));
   
   // After:
   api.getUsers()
     .then(response => setUsers(response.data));
   ```

4. For complex cases, use the migration utility:
   ```javascript
   import { migrateApiCall } from '../utils/apiMigration';
   
   // Before:
   fetch('https://api.external.com/users?active=true', options)
   
   // After:
   migrateApiCall('https://api.external.com/users?active=true', options)
   ```

## Environment Configuration

The server needs these environment variables:

```
API_SECRET_TOKEN=your_api_token_here
EXTERNAL_API_BASE_URL=https://api.external-service.com
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Performance Optimizations

The implementation includes several performance optimizations:

1. **Response Caching**: GET requests are cached for 5 minutes to reduce load on external APIs
2. **Rate Limiting**: Prevents abuse and ensures fair usage of the proxy
3. **Headers Handling**: Only necessary headers are forwarded to external APIs
4. **Cookie-Based Sessions**: Reduces overhead compared to token validation on every request

## Additional Security Recommendations

1. **HTTPS**: Always use HTTPS for all communications
2. **Content Security Policy**: Implement CSP headers to prevent XSS attacks
3. **Regular Token Rotation**: Regularly rotate server-side API tokens
4. **Access Logs**: Monitor API access patterns for suspicious activity
5. **Input Validation**: Validate all input on both client and server sides 