# API Token Authentication

## Overview

This API uses token-based authentication for external clients (such as Postman, cURL, or custom applications) that access data modification endpoints. This ensures that only authorized applications can create, update, or delete data.

## Token Requirements

When making requests from external tools like Postman, you must include an API token in the Authorization header for the following operations:
- Creating new records (POST requests)
- Updating existing records (PUT/PATCH requests)
- Deleting records (DELETE requests)

GET requests for public data do not require authentication.

## How to Use API Tokens

### Authorization Header Format

Include your API token in the request headers using one of these formats:

```
Authorization: Bearer your_api_token_here
```

or 

```
Authorization: ApiKey your_api_token_here
```

### Example in Postman

1. Create a new request in Postman
2. Go to the "Headers" tab
3. Add a header with:
   - Key: `Authorization`
   - Value: `Bearer your_api_token_here`
4. Send your request

### Example with cURL

```bash
curl -X POST https://your-api-domain.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_api_token_here" \
  -d '{"name": "Product Name", "price": 19.99, "description": "Product description"}'
```

## Obtaining an API Token

For security reasons, API tokens are not publicly available. Contact the system administrator to obtain a valid API token for your application.

## Error Responses

If you try to access a protected endpoint without a valid token, you will receive:

```json
{
  "success": false,
  "message": "Authorization header missing"
}
```

Or if the token is invalid:

```json
{
  "success": false,
  "message": "Invalid API token"
}
```

## Note for Web Application Users

The web application handles authentication automatically using cookies. This token-based authentication is specifically for external API clients and does not affect normal website usage. 