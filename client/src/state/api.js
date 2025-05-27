import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BASE_URL,
    credentials: 'include', // Important for CORS with cookies
    mode: 'cors', // Explicitly set CORS mode
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const token = getState().global?.token;
      
      // Use API token directly from environment for now for simplicity
      // In production, this should be obtained securely from the server
      const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
      
      // Debug token presence in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth tokens available:', { 
          reduxToken: !!token, 
          apiToken: !!apiToken 
        });
      }
      
      // Add standard headers for CORS
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      // Always use the API token for simplicity during debugging
      if (apiToken) {
        headers.set('Authorization', `ApiKey ${apiToken}`);
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
    // User endpoints
    getUser: build.query({
      query: (id) => `users/${id}`,
      providesTags: ["User"],
    }),
    getUsers: build.query({
      query: () => "users",
      providesTags: ["User"],
    }),
    createUser: build.mutation({
      query: (data) => ({
        url: "users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...data }) => ({
        url: `users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation({
      query: (id) => {
        console.log('Deleting user with ID:', id);
        return {
          url: `users/${id}`,
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
          url: `users/${id}/photo`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),
    
    // Blog endpoints
    getBlogs: build.query({
      query: ({ status, category, featured, search, limit, page } = {}) => {
        let url = 'blogs/posts?';
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
      query: (id) => `blogs/posts/${id}`,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
    getBlogBySlug: build.query({
      query: (slug) => `blogs/posts/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blogs", slug }],
    }),
    getBlogCategories: build.query({
      query: () => "blogs/categories",
      providesTags: ["Blogs"],
    }),
    getBlogTags: build.query({
      query: () => "blogs/tags",
      providesTags: ["Blogs"],
    }),
    uploadBlogImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "blogs/images/upload",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createBlog: build.mutation({
      query: (data) => ({
        url: "blogs/posts/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...data }) => ({
        url: `blogs/posts/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Blogs",
        { type: "Blogs", id }
      ],
    }),
    deleteBlog: build.mutation({
      query: (id) => ({
        url: `blogs/posts/remove/${id}`,
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
      query: (data) => ({
        url: "v1/data/items",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/items/${id}`,
        method: "PUT",
        body: data,
      }),
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
      query: () => "orders/list",
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: (data) => ({
        url: "orders/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrder: build.mutation({
      query: ({ id, data }) => ({
        url: `orders/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: build.mutation({
      query: (id) => ({
        url: `orders/remove/${id}`,
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
      query: (data) => ({
        url: "v1/data/inquiries",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    updateEnquiry: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/inquiries/${id}`,
        method: "PUT",
        body: data,
      }),
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
      query: () => "notifications/list",
      providesTags: ["Notifications"],
      pollingInterval: 30000,
    }),
    createNotification: build.mutation({
      query: (data) => ({
        url: "notifications/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    updateNotification: build.mutation({
      query: ({ id, ...data }) => ({
        url: `notifications/mark-read/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    
    // Active Users endpoints
    getActiveUsers: build.query({
      query: () => "active-users/sessions",
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
      }),
      invalidatesTags: ["Visitors"],
    }),
    updateVisitor: build.mutation({
      query: ({ id, ...data }) => ({
        url: `v1/data/visitors/${id}`,
        method: "PUT",
        body: data,
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
      query: () => "/user-statistics",
      providesTags: ["UserStatistics"],
    }),
    
    getActiveUserStats: build.query({
      query: () => "/active-users",
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
      query: () => "cards/list",
      providesTags: ["Cards"],
    }),
    getCard: build.query({
      query: (id) => `cards/details/${id}`,
      providesTags: (result, error, id) => [{ type: "Cards", id }],
    }),
    uploadCardImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading card image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "cards/images/upload",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createCard: build.mutation({
      query: (data) => ({
        url: "cards/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cards"],
    }),
    updateCard: build.mutation({
      query: ({ id, ...data }) => ({
        url: `cards/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Cards",
        { type: "Cards", id }
      ],
    }),
    deleteCard: build.mutation({
      query: (id) => ({
        url: `cards/remove/${id}`,
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
