# SwanSorter Admin API Documentation

## Base URL
```
http://localhost:5000/api
```

## Database Name: swansorterAdmin_db

## Table of Contents
1. [Users API](#1-users-api)
2. [Visitors API](#2-visitors-api)
3. [Active Users API](#3-active-users-api)
4. [User Statistics API](#4-user-statistics-api)
5. [Notifications API](#5-notifications-api)
6. [Products API](#6-products-api)
7. [Orders API](#7-orders-api)
8. [Enquiries API](#8-enquiries-api)

## Common Features
- Pagination on all GET endpoints
- Soft delete functionality
- Timestamp tracking (created_at, updated_at)
- Error handling with appropriate status codes

## Common Query Parameters
For all GET endpoints:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## Common Response Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Server Error

---

## 1. Users API

### Collection Name: Users

### Schema
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String,
  "password": String,
  "role": String, // "admin" or "customer"
  "profile_image": String,
  "is_active": Boolean,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate,
  "created_by": String,
  "updated_by": String
}
```

### Endpoints

#### Get All Users
```http
GET /users

Response:
{
  "users": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "profile_image": "https://example.com/admin.jpg",
      "is_active": true,
      "created_by": "system",
      "updated_by": "system"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create User
```http
POST /users

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "profile_image": "https://example.com/john.jpg",
  "created_by": "system",
  "updated_by": "system"
}
```

#### Update User
```http
PUT /users/:id

Request Body:
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "updated_by": "system"
}
```

#### Delete User
```http
DELETE /users/:id
```

---

## 2. Visitors API

### Collection Name: visitorscollections

### Schema
```javascript
{
  "_id": ObjectId,
  "ip_address": String,
  "location": {
    "country": String,
    "city": String,
    "latitude": Number,
    "longitude": Number
  },
  "visit_count": Number,
  "last_visited_at": ISODate,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Endpoints

#### Get All Visitors
```http
GET /visitors

Response:
{
  "visitors": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "ip_address": "192.168.1.1",
      "location": {
        "country": "United States",
        "city": "New York",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "visit_count": 5,
      "last_visited_at": "2024-02-13T14:30:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create/Update Visitor
```http
POST /visitors

Request Body:
{
  "ip_address": "192.168.1.100",
  "location": {
    "country": "India",
    "city": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777
  }
}
```

#### Get Visitor Statistics
```http
GET /visitors/statistics

Response:
{
  "totalUniqueVisitors": 100,
  "totalVisits": 500,
  "visitorsByCountry": [
    {
      "_id": "United States",
      "count": 50,
      "totalVisits": 250
    }
  ]
}
```

---

## 3. Active Users API

### Collection Name: activeUsers

### Schema
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "session_duration": Number,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate,
  "Location": String
}
```

### Endpoints

#### Get All Active Users
```http
GET /active-users

Response:
{
  "activeUsers": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "user_id": {
        "_id": "65cb7a8d1234567890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "session_duration": 3600,
      "Location": "40.7128,-74.0060"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create Active Session
```http
POST /active-users

Request Body:
{
  "user_id": "65cb7a8d1234567890abcdef",
  "session_duration": 3600,
  "Location": "19.0760,72.8777"
}
```

#### Update Session
```http
PUT /active-users/:id

Request Body:
{
  "session_duration": 7200,
  "Location": "19.0760,72.8777"
}
```

---

## 4. User Statistics API

### Collection Name: userStatistics

### Schema
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "pages_visited": [
    {
      "page_name": String,
      "visit_count": Number
    }
  ],
  "total_time_spent": Number,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Endpoints

#### Get All Statistics
```http
GET /user-statistics

Response:
{
  "statistics": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "user_id": {
        "_id": "65cb7a8d1234567890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "pages_visited": [
        {
          "page_name": "home",
          "visit_count": 10
        }
      ],
      "total_time_spent": 7200
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create/Update Statistics
```http
POST /user-statistics

Request Body:
{
  "user_id": "65cb7a8d1234567890abcdef",
  "page_name": "cart",
  "time_spent": 300
}
```

#### Get Overall Statistics
```http
GET /user-statistics/overall

Response:
{
  "totalUsers": 100,
  "mostVisitedPages": [
    {
      "_id": "home",
      "totalVisits": 500
    }
  ],
  "averageTimeSpent": 3600
}
```

---

## 5. Notifications API

### Collection Name: notifications

### Schema
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "message": String,
  "is_read": Boolean,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Endpoints

#### Get All Notifications
```http
GET /notifications

Response:
{
  "notifications": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "user_id": {
        "_id": "65cb7a8d1234567890abcdef",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "message": "Your order has been shipped",
      "is_read": false
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create Notification
```http
POST /notifications

Request Body:
{
  "user_id": "65cb7a8d1234567890abcdef",
  "message": "New product available"
}
```

#### Mark as Read
```http
PUT /notifications/:id/read
```

---

## 6. Products API

### Collection Name: productsList

### Schema
```javascript
{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "price": Number,
  "stock_quantity": Number,
  "image_url": String,
  "is_active": Boolean,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Endpoints

#### Get All Products
```http
GET /products

Response:
{
  "products": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "name": "Laptop Pro",
      "description": "High-performance laptop",
      "price": 1299.99,
      "stock_quantity": 50,
      "image_url": "https://example.com/laptop.jpg",
      "is_active": true
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create Product
```http
POST /products

Request Body:
{
  "name": "Smartphone X",
  "description": "Latest smartphone",
  "price": 799.99,
  "stock_quantity": 100,
  "image_url": "https://example.com/phone.jpg"
}
```

---

## 7. Orders API

### Collection Name: ordersList

### Schema
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "order_number": String,
  "products": [
    {
      "product_id": ObjectId,
      "quantity": Number,
      "price": Number
    }
  ],
  "total_amount": Number,
  "status": String,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Endpoints

#### Get All Orders
```http
GET /orders

Response:
{
  "orders": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "user_id": {
        "_id": "65cb7a8d1234567890abcdef",
        "name": "John Doe"
      },
      "order_number": "ORD-001",
      "products": [
        {
          "product_id": {
            "_id": "65cb7a8d1234567890abcdef",
            "name": "Laptop Pro"
          },
          "quantity": 1,
          "price": 1299.99
        }
      ],
      "total_amount": 1299.99,
      "status": "pending"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create Order
```http
POST /orders

Request Body:
{
  "user_id": "65cb7a8d1234567890abcdef",
  "products": [
    {
      "product_id": "65cb7a8d1234567890abcdef",
      "quantity": 1,
      "price": 1299.99
    }
  ],
  "total_amount": 1299.99
}
```

---

## 8. Enquiries API

### Collection Name: usersEnquires

### Schema
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "message": String,
  "status": String,
  "is_deleted": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Endpoints

#### Get All Enquiries
```http
GET /enquiries

Response:
{
  "enquiries": [
    {
      "_id": "65cb7a8d1234567890abcdef",
      "user_id": {
        "_id": "65cb7a8d1234567890abcdef",
        "name": "John Doe"
      },
      "message": "Need help with my order",
      "status": "open"
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```

#### Create Enquiry
```http
POST /enquiries

Request Body:
{
  "user_id": "65cb7a8d1234567890abcdef",
  "message": "Product inquiry"
}
```

## Mock Data Examples

You can use the following command to populate your database with mock data:

```bash
node seedData.js
```

This will create:
- 2 users (1 admin, 1 customer)
- 2 visitors with location data
- 2 products
- 2 orders
- 2 enquiries
- 2 active user sessions
- 2 user statistics records
- 2 notifications

The mock data is designed to showcase all the features and relationships between different collections in the database.
