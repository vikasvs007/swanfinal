import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Helper function to normalize and validate data for API mutations
 * This ensures data is properly formatted for the backend validation
 * @param {Object} data - The data to normalize
 * @param {Object} options - Options for normalization
 * @returns {Object} - Normalized data
 */
const normalizeMutationData = (data, options = {}) => {
  // Make a copy to avoid mutating the original data
  const normalized = {...data};
  
  // Process each field
  Object.keys(normalized).forEach(key => {
    const value = normalized[key];
    
    // Handle numeric conversions
    if (options.numericFields?.includes(key)) {
      normalized[key] = Number(value);
    }
    
    // Handle string values - trim and ensure no undefined values are sent
    if (typeof value === 'string') {
      normalized[key] = value.trim() || "";
    }
    
    // Remove empty values unless explicitly preserved
    if (value === "" && !options.preserveEmpty) {
      delete normalized[key];
    }
    
    // Map field names if needed
    if (options.fieldMapping && options.fieldMapping[key]) {
      normalized[options.fieldMapping[key]] = normalized[key];
      delete normalized[key];
    }
  });
  
  return normalized;
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BASE_URL || 'https://swanfinal.onrender.com/api',
    credentials: 'include', // Important for CORS with cookies
    mode: 'cors', // Explicitly set CORS mode
    cache: 'no-cache', // Prevent caching issues
    fetchFn: async (...args) => {
      // Log the request details in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request:', args[0], args[1]);
      }
      return fetch(...args);
    },
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const token = getState().global?.token;
      
      // Use API token from environment variables
      const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
      
      // Debug token presence in development
      if (process.env.NODE_ENV === 'production') {
        console.log('Auth tokens available:', { 
          reduxToken: !!token, 
          apiToken: !!apiToken,
          baseUrl: process.env.REACT_APP_BASE_URL || 'https://swanfinal.onrender.com/api'
        });
      }
      
      // Add standard headers for CORS
      headers.set('Content-Type', 'application/json');
      
      // In production, always include authorization to ensure all methods work
      if (process.env.NODE_ENV === 'production') {
        if (apiToken) {
          headers.set('Authorization', `Bearer ${apiToken}`);
          console.log('Setting API key auth header for production');
        } else {
          console.warn('API token not available in production environment');
        }
      }
      // Otherwise use the API token if available
      else if (apiToken) {
        headers.set('Authorization', `Bearer ${apiToken}`);
      } else if (token) {
        // Fallback to JWT token if no API token is available
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  reducerPath: "adminApi",
  tagTypes: [
    "User",
    "Products",
    "Orders",
    "Enquiries",
    "Notifications",
    "ActiveUsers",
    "Visitors",
    "UserStatistics",
    "Geography",
    "Blogs",
    "Cards",
  ],
  endpoints: (build) => ({
    // User endpoints - updated to v1 API structure
    getUser: build.query({
      query: (id) => `v1/data/users/${id}`,
      providesTags: ["User"],
    }),
    getUsers: build.query({
      query: () => "v1/data/users",
      providesTags: ["User"],
    }),
    createUser: build.mutation({
      query: (data) => ({
        url: "v1/data/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation({
      query: (id) => {
        console.log('Deleting user with ID:', id);
        return {
          url: `v1/data/users/${id}`,
          method: "DELETE",
        };
      },
      // Add onError callback for better error handling
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          console.log('User deleted successfully:', id);
        } catch (error) {
          console.error('Error deleting user:', error);
        }
      },
      invalidatesTags: ["User"],
    }),
    uploadPhoto: build.mutation({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append("photo", photo);
        return {
          url: `v1/data/users/${id}/photo`,
          method: "POST",
          body: formData,
          prepareHeaders: (headers) => {
            headers.delete('Content-Type'); // Allow browser to set Content-Type for FormData
            return headers;
          },
        };
      },
      invalidatesTags: ["User"],
    }),
    
    // Blog endpoints
    getBlogs: build.query({
      query: ({ status, category, featured, search, limit, page } = {}) => {
        let url = 'v1/data/blogs/posts?';
        if (status) url += `status=${status}&`;
        if (category) url += `category=${category}&`;
        if (featured) url += `featured=${featured}&`;
        if (search) url += `search=${search}&`;
        if (limit) url += `limit=${limit}&`;
        if (page) url += `page=${page}&`;
        return url;
      },
      providesTags: ["Blogs"],
    }),
    getBlog: build.query({
      query: (id) => `v1/data/blogs/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
    getBlogBySlug: build.query({
      query: (slug) => `v1/data/blogs/posts/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blogs", slug }],
    }),
    getBlogCategories: build.query({
      query: () => "v1/data/blogs/categories",
      providesTags: ["Blogs"],
    }),
    getBlogTags: build.query({
      query: () => "v1/data/blogs/tags",
      providesTags: ["Blogs"],
    }),
    uploadBlogImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "v1/data/blogs/images/upload",
          method: "POST",
          body: formData,
          formData: true,
          // Remove content-type header so browser can set it with boundary for multipart/form-data
          prepareHeaders: (headers) => {
            headers.delete('Content-Type');
            // Always add authorization in production
            if (process.env.NODE_ENV === 'production') {
              const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
              if (apiToken) {
                headers.set('Authorization', `Bearer ${apiToken}`);
              }
            }
            return headers;
          },
        };
      },
    }),
    createBlog: build.mutation({
      query: (data) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          preserveEmpty: true,
        });
        
        return {
          url: "v1/data/blogs/posts",
          method: "POST",
          body: normalizedData,
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...data }) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          preserveEmpty: true,
        });
        
        return {
          url: `v1/data/blogs/posts/update/${id}`, // Corrected URL path
          method: "PUT",
          body: normalizedData,
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
      invalidatesTags: (result, error, { id }) => [
        "Blogs",
        { type: "Blogs", id }
      ],
    }),
    deleteBlog: build.mutation({
      query: (id) => ({
        url: `v1/data/blogs/posts/remove/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
    
    // Product endpoints
    getProducts: build.query({
      query: () => "v1/data/items",
      providesTags: ["Products"],
    }),
    getProductById: build.query({
      query: (id) => `v1/data/items/${id}`,
      providesTags: ["Products"],
    }),
    createProduct: build.mutation({
      query: (data) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          numericFields: ['price', 'stock_quantity', 'stock'],
          fieldMapping: { stock_quantity: 'stock' }, // Map stock_quantity to stock to match server expectation
        });
        
        return {
          url: "v1/data/items",
          method: "POST",
          body: normalizedData, // Use normalized data
          // Add custom headers for this request
          prepareHeaders: (headers) => {
            // Always use API token in production
            if (process.env.NODE_ENV === 'production') {
              const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
              if (apiToken) {
                headers.set('Authorization', `Bearer ${apiToken}`);
                console.log('Setting product creation API token auth header');
              }
            }
            return headers;
          }
        };
      },
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...data }) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          numericFields: ['price', 'stock_quantity', 'stock'],
          fieldMapping: { stock_quantity: 'stock' }, // Map stock_quantity to stock to match server expectation
        });
        
        return {
          url: `v1/data/items/${id}`,
          method: "PUT",
          body: normalizedData, // Use normalized data
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `v1/data/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    
    // Order endpoints
    getOrders: build.query({
      query: () => "v1/data/orders/list",
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: (data) => {
        // Normalize data for server validation
        let normalizedData = normalizeMutationData(data, {
          numericFields: ['total_amount', 'quantity', 'price'],
          preserveEmpty: true,
        });
        
        // Ensure required fields are present
        normalizedData = {
          ...normalizedData,
          // Default values for required fields if not provided
          total_amount: normalizedData.total_amount || 0,
          order_number: normalizedData.order_number || `ORD-${Date.now()}`
        };
        
        // Build the request with proper authorization
        return {
          url: "v1/data/orders/create",
          method: "POST",
          body: normalizedData,
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
      invalidatesTags: ["Orders"],
    }),
    updateOrder: build.mutation({
      query: ({ id, data }) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          numericFields: ['total_amount', 'quantity', 'price'],
          preserveEmpty: true,
        });
        
        return {
          url: `v1/data/orders/update/${id}`,
          method: "PUT",
          body: normalizedData,
          // Add custom headers for this request
          prepareHeaders: (headers) => {
            // Always use API token in production
            if (process.env.NODE_ENV === 'production') {
              const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
              if (apiToken) {
                headers.set('Authorization', `Bearer ${apiToken}`);
                console.log('Setting order update API token auth header');
              }
            }
            return headers;
          }
        };
      },
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: build.mutation({
      query: (id) => ({
        url: `v1/data/orders/remove/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
    
    // Enquiry endpoints
    getEnquiries: build.query({
      query: () => "v1/data/inquiries",
      providesTags: ["Enquiries"],
    }),
    createEnquiry: build.mutation({
      query: (data) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          // Ensure all required fields have values
          preserveEmpty: true, // Keep empty fields that should be preserved
        });
        
        // Ensure required fields are present with proper values
        normalizedData.name = normalizedData.name || "";
        normalizedData.email = normalizedData.email || "";
        normalizedData.subject = normalizedData.subject || "";
        normalizedData.message = normalizedData.message || "";
        
        return {
          url: "v1/data/inquiries",
          method: "POST",
          body: normalizedData,
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
      invalidatesTags: ["Enquiries"],
    }),
    updateEnquiry: build.mutation({
      query: ({ id, ...data }) => {
        // Normalize data for server validation
        const normalizedData = normalizeMutationData(data, {
          // Ensure all required fields have values
          preserveEmpty: true, // Keep empty fields that should be preserved
        });
        
        // Ensure required fields are present with proper values
        normalizedData.name = normalizedData.name || "";
        normalizedData.email = normalizedData.email || "";
        normalizedData.subject = normalizedData.subject || "";
        normalizedData.message = normalizedData.message || "";
        
        return {
          url: `v1/data/inquiries/${id}`,
          method: "PUT",
          body: normalizedData,
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
      invalidatesTags: ["Enquiries"],
    }),
    deleteEnquiry: build.mutation({
      query: (id) => ({
        url: `v1/data/inquiries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiries"],
    }),
    
    // Notification endpoints
    getNotifications: build.query({
      query: () => "v1/data/notifications/list",
      providesTags: ["Notifications"],
      pollingInterval: 30000,
    }),
    createNotification: build.mutation({
      query: (data) => ({
        url: "v1/data/notifications/create",
        method: "POST",
        body: data,
        prepareHeaders: (headers) => {
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          if (apiToken) {
            headers.set('Authorization', `Bearer ${apiToken}`);
          }
          return headers;
        },
      }),
      invalidatesTags: ["Notifications"],
    }),
    updateNotification: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/notifications/mark-read/${id}`,
        method: "PUT",
        body: data,
        prepareHeaders: (headers) => {
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          if (apiToken) {
            headers.set('Authorization', `Bearer ${apiToken}`);
          }
          return headers;
        },
      }),
      invalidatesTags: ["Notifications"],
    }),
    
    // Active Users endpoints
    getActiveUsers: build.query({
      query: () => "v1/data/active-users/sessions",
      providesTags: ["ActiveUsers"],
      transformResponse: (response) => {
        // Transform the response to include only the active users array
        return {
          activeUsers: response.activeUsers || [],
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1
        };
      },
      pollingInterval: 30000, // Poll every 30 seconds
    }),
    
    // Visitors endpoints
    getVisitors: build.query({
      query: () => "v1/data/visitors",
      providesTags: ["Visitors"],
      pollingInterval: 30000,
    }),
    createVisitor: build.mutation({
      query: (data) => ({
        url: "v1/data/visitors",
        method: "POST",
        body: data,
        prepareHeaders: (headers) => {
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          if (apiToken) {
            headers.set('Authorization', `Bearer ${apiToken}`);
          }
          return headers;
        },
      }),
      invalidatesTags: ["Visitors"],
    }),
    updateVisitor: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/visitors/${id}`,
        method: "PUT",
        body: data,
        prepareHeaders: (headers) => {
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          if (apiToken) {
            headers.set('Authorization', `Bearer ${apiToken}`);
          }
          return headers;
        },
      }),
      invalidatesTags: ["Visitors", "Geography"],
    }),
    deleteVisitor: build.mutation({
      query: (id) => ({
        url: `v1/data/visitors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Visitors"],
    }),
    
    // User Statistics endpoints
    getUserStatistics: build.query({
      query: () => "/v1/data/user-statistics",
      providesTags: ["UserStatistics"],
    }),
    
    getActiveUserStats: build.query({
      query: () => "/v1/data/active-users",
      providesTags: ["ActiveUsers"],
    }),
    
    getVisitorStats: build.query({
      query: () => "v1/data/visitors",
      providesTags: ["Visitors"],
    }),
    
    // Geography endpoints
    getGeography: build.query({
      query: () => "v1/data/visitors/geography",
      providesTags: ["Geography"]
    }),
    
    // Card endpoints
    getCards: build.query({
      query: () => "v1/data/cards/list",
      providesTags: ["Cards"],
    }),
    getCard: build.query({
      query: (id) => `v1/data/cards/details/${id}`,
      providesTags: (result, error, id) => [{ type: "Cards", id }],
    }),
    uploadCardImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading card image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "v1/data/cards/images/upload",
          method: "POST",
          body: formData,
          formData: true,
          prepareHeaders: (headers) => {
            const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
            if (apiToken) {
              headers.set('Authorization', `Bearer ${apiToken}`);
            }
            return headers;
          },
        };
      },
    }),
    createCard: build.mutation({
      query: (data) => ({
        url: "v1/data/cards/create",
        method: "POST",
        body: data,
        prepareHeaders: (headers) => {
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          if (apiToken) {
            headers.set('Authorization', `Bearer ${apiToken}`);
          }
          return headers;
        },
      }),
      invalidatesTags: ["Cards"],
    }),
    updateCard: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/cards/update/${id}`,
        method: "PUT",
        body: data,
        prepareHeaders: (headers) => {
          const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
          if (apiToken) {
            headers.set('Authorization', `Bearer ${apiToken}`);
          }
          return headers;
        },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Cards",
        { type: "Cards", id }
      ],
    }),
    deleteCard: build.mutation({
      query: (id) => ({
        url: `v1/data/cards/remove/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cards"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadPhotoMutation,
  
  useGetBlogsQuery,
  useGetBlogQuery,
  useGetBlogBySlugQuery,
  useGetBlogCategoriesQuery,
  useGetBlogTagsQuery,
  useUploadBlogImageMutation,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetEnquiriesQuery,
  useCreateEnquiryMutation,
  useUpdateEnquiryMutation,
  useDeleteEnquiryMutation,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useGetActiveUsersQuery,
  useGetVisitorsQuery,
  useGetUserStatisticsQuery,
  useGetActiveUserStatsQuery,
  useGetVisitorStatsQuery,
  useGetGeographyQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useGetCardsQuery,
  useGetCardQuery,
  useUploadCardImageMutation,
  useCreateCardMutation,
  useUpdateCardMutation,
  useDeleteCardMutation,
} = api;
