# API Token Authentication Guide

This document explains how to use API tokens to authenticate requests to the API.

## Overview

For programmatic access to the API (e.g., via Postman, scripts, or other applications), you can use an API token for authentication instead of user credentials.

## API Token Format

The API token should be included in the `Authorization` header of your requests using one of the following formats:

1. Bearer Token:
```
Authorization: Bearer swanapi_sec_token_7890xyz
```

2. API Key:
```
Authorization: ApiKey swanapi_sec_token_7890xyz
```

Both formats are supported and will provide the same level of access.

## Protected Routes

Most routes now require authentication (either via API token or JWT), including:

### Always Require Authentication:
- All POST operations for creating resources (except public endpoints like visitor tracking)
- All PUT operations for updating resources
- All DELETE operations for removing resources
- Most GET operations for retrieving sensitive data

### Public Endpoints (No Authentication Required):
- GET /api/products - List products
- GET /api/products/:id - View a product
- GET /api/blogs - List blogs
- GET /api/blogs/:id - View a blog
- GET /api/cards - List cards
- GET /api/cards/:id - View a card
- POST /api/enquiries - Submit an enquiry
- POST /api/visitors - Record visitor data
- POST /api/active-users - Record active user sessions
- POST /api/user-statistics - Record user statistics
- POST /api/users - User registration

## Example Usage

### Using cURL

```bash
curl -X POST https://your-api-domain.com/api/products \
  -H "Authorization: Bearer swanapi_sec_token_7890xyz" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Product", "price": 99.99}'
```

### Using Postman

1. Create a new request
2. Select the HTTP method (POST, PUT, DELETE)
3. Enter the request URL
4. Go to the "Headers" tab
5. Add a header with Key "Authorization" and Value "Bearer swanapi_sec_token_7890xyz"
6. Add your request body if needed
7. Send the request

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

async function makeApiRequest() {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://your-api-domain.com/api/products',
      headers: {
        'Authorization': 'Bearer swanapi_sec_token_7890xyz',
        'Content-Type': 'application/json'
      },
      data: {
        name: 'New Product',
        price: 99.99
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

makeApiRequest();
```

## Security Best Practices

1. Keep your API token secure and do not share it publicly
2. Use HTTPS for all API requests to encrypt data in transit
3. Consider rotating your API token periodically
4. Monitor API usage for suspicious activity

## Rate Limiting

API token requests are subject to the same rate limiting as regular user requests to prevent abuse. 