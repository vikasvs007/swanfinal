# CRUD Application Client

This is the client-side application for the CRUD management system. It's built with React, Material UI, and Redux Toolkit.

## Features

- User authentication and profile management
- Blog management with image uploads
- Visitor tracking with geographical information
- Product and order management
- User statistics and notifications
- Responsive admin dashboard

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with:
   ```
   REACT_APP_BASE_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```
   npm start
   ```

## Project Structure

- `/src/components`: Reusable UI components
- `/src/scenes`: Page components organized by feature
- `/src/state`: Redux store, slices, and API configuration
- `/src/assets`: Static assets like images and icons
- `/src/theme.js`: Theme configuration for Material UI

## State Management

This application uses Redux Toolkit for state management. The store configuration is in `/src/state/store.js`, and the API calls are managed with RTK Query in `/src/state/api.js`.

## Common Issues and Solutions

### Image Upload Issues

If images aren't displaying correctly:

1. Make sure the server is running and the uploads directory exists
2. Check that the correct URL is being used (with proper server base URL)
3. Verify that the image paths are being stored correctly in the database

### ESLint Errors

Common ESLint errors and their solutions:

1. Undefined components: Make sure components are properly imported
2. Redux store access: Import the store from 'state/store'
3. Unused variables: Remove or comment out unused imports and variables

## Contributing

Please follow the established code style and patterns when contributing to this project.
