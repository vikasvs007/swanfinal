# API Token Authentication

This document explains how to use API tokens to authenticate with the API programmatically without requiring user login.

## Overview

API token authentication allows clients to access the API without going through the standard user login flow. This is particularly useful for:

- Server-to-server communication
- Background jobs
- Integration with third-party services
- Automated testing

## Obtaining an API Token

There are two ways to obtain an API token:

1. **Through the Web Interface:**
   - Log in to the application with an admin account
   - Navigate to the Profile page 
   - Use the API Token Manager to generate a new token
   - Copy and securely store the generated token

2. **Using Environment Variables:**
   - For development, you can set `REACT_APP_API_TOKEN` in your `.env.development` file
   - For production, set this value during deployment
   - The application will use this value if no token is already stored

## Using the API Token

When making requests to the API, include the API token in the `Authorization` header:

```
Authorization: ApiKey YOUR_API_TOKEN
```

### Example Requests

#### JavaScript (fetch)

```javascript
const apiToken = "YOUR_API_TOKEN";

async function fetchData() {
  try {
    const response = await fetch('https://your-api-url.com/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${apiToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
```

#### Node.js (axios)

```javascript
const axios = require('axios');

const apiToken = "YOUR_API_TOKEN";
const baseUrl = "https://your-api-url.com/api";

const apiClient = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `ApiKey ${apiToken}`
  }
});

// Example: Get all users
async function getUsers() {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.message);
    throw error;
  }
}
```

#### Python (requests)

```python
import requests

api_token = "YOUR_API_TOKEN"
base_url = "https://your-api-url.com/api"

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'ApiKey {api_token}'
}

def get_users():
    try:
        response = requests.get(f'{base_url}/users', headers=headers)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching users: {e}")
        return None
```

#### cURL

```bash
curl -X GET "https://your-api-url.com/api/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: ApiKey YOUR_API_TOKEN"
```

## Security Best Practices

1. **Never expose API tokens in client-side code** that will be publicly accessible
2. **Store tokens securely** in environment variables or secure credential storage
3. **Rotate tokens regularly** to limit the impact of token leakage
4. **Use HTTPS** for all API requests to prevent token interception
5. **Implement token expiration** for sensitive operations
6. **Limit token scope** to only the necessary operations
7. **Revoke compromised tokens** immediately

## Token Lifecycle

- **Generation**: Tokens are generated through the API Token Manager
- **Storage**: Tokens are stored in the client's localStorage
- **Usage**: Tokens are sent with each API request in the Authorization header
- **Revocation**: Tokens can be revoked through the API Token Manager

## Error Handling

If the API token is invalid or expired, the API will return a 401 Unauthorized response:

```json
{
  "success": false,
  "message": "Invalid API token"
}
```

Your client code should handle this error and either prompt for a new token or handle the authentication failure appropriately.

## Support

If you encounter any issues with API token authentication, please contact the system administrator. 