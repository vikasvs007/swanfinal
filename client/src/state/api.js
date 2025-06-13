import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BASE_URL ,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux state
      const token = getState().global?.token;
      
      // Check for API token in localStorage
      const apiToken = process.env.REACT_APP_API_SECRET_TOKEN;
      
      // Debug token presence in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth tokens available:', { 
          reduxToken: !!token, 
          apiToken: !!apiToken 
        });
      }
      
      if (apiToken) {
        // Use ApiKey authorization header for API token
        headers.set("authorization", `ApiKey ${apiToken}`);
      } else if (token) {
        // Use Bearer authorization header for JWT token
        headers.set("authorization", `Bearer ${token}`);
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
      query: (id) => `user-management/${id}`,
      providesTags: ["user"],
    }),
    getUsers: build.query({
      query: () => "user-management",
      providesTags: ["user"],
    }),
    createUser: build.mutation({
      query: (data) => ({
        url: "user-management",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...data }) => ({
        url: `user-management/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),
    deleteUser: build.mutation({
      query: (id) => {
        console.log('Deleting user with ID:', id);
        return {
          url: `user-management/${id}`,
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
      invalidatesTags: ["user"],
    }),
    uploadPhoto: build.mutation({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append("photo", photo);
        return {
          url: `user-management/${id}/photo`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["user"],
    }),
    
    // Blog endpoints
    getBlogs: build.query({
      query: ({ status, category, featured, search, limit, page } = {}) => {
        let url = 'blog-content?';
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
      query: (id) => `blog-content/${id}`,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
    getBlogBySlug: build.query({
      query: (slug) => `blog-content/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blogs", slug }],
    }),
    getBlogCategories: build.query({
      query: () => "blog-content/categories",
      providesTags: ["Blogs"],
    }),
    getBlogTags: build.query({
      query: () => "blog-content/tags",
      providesTags: ["Blogs"],
    }),
    uploadBlogImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "blog-content/upload-image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createBlog: build.mutation({
      query: (data) => ({
        url: "blog-content",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...data }) => ({
        url: `blog-content/${id}`,
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
        url: `blog-content/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
    
    // Product endpoints
    getProducts: build.query({
      query: () => ({
        url: "product-catalog",
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      providesTags: ["Products"],
    }),
    createProduct: build.mutation({
      query: (data) => ({
        url: "product-catalog",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `product-catalog/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `product-catalog/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Products"],
    }),
    
    // Order endpoints
    getOrders: build.query({
      query: () => ({
        url: "order-management",
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: (data) => ({
        url: "order-management",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrder: build.mutation({
      query: ({ id, data }) => ({
        url: `order-management/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: build.mutation({
      query: (id) => ({
        url: `order-management/${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Orders"],
    }),
    
    // Enquiry endpoints
    getEnquiries: build.query({
      query: () => "enquiry-handling",
      providesTags: ["Enquiries"],
    }),
    createEnquiry: build.mutation({
      query: (data) => ({
        url: "enquiry-handling",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    updateEnquiry: build.mutation({
      query: ({ id, ...data }) => ({
        url: `enquiry-handling/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    deleteEnquiry: build.mutation({
      query: (id) => ({
        url: `enquiry-handling/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiries"],
    }),
    
    // Notification endpoints
    getNotifications: build.query({
      query: () => "notification-center",
      providesTags: ["Notifications"],
      pollingInterval: 30000,
    }),
    createNotification: build.mutation({
      query: (data) => ({
        url: "notification-center",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    updateNotification: build.mutation({
      query: ({ id, ...data }) => ({
        url: `notification-center/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    
    // Active Users endpoints
    getActiveUsers: build.query({
      query: () => "active-users",
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
      query: () => "visitor-tracking",
      providesTags: ["Visitors"],
      pollingInterval: 30000,
    }),
    createVisitor: build.mutation({
      query: (data) => ({
        url: "visitor-tracking",
        method: "POST",
        body: data,
        headers: {
          "Content-Type": "application/json",
          "authorization": `ApiKey ${process.env.REACT_APP_API_SECRET_TOKEN}`,
        },
      }),
      invalidatesTags: ["Visitors"],
    }),
    updateVisitor: build.mutation({
      query: ({ id, ...data }) => ({
        url: `visitor-tracking/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Visitors", "Geography"],
    }),
    deleteVisitor: build.mutation({
      query: (id) => ({
        url: `visitor-tracking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Visitors"],
    }),
    
    // User Statistics endpoints
    getUserStatistics: build.query({
      query: () => "user-analytics/overall",
      providesTags: ["UserStatistics"],
    }),
    
    getActiveUserStats: build.query({
      query: () => "active-users/statistics",
      providesTags: ["ActiveUsers"],
    }),
    
    getVisitorStats: build.query({
      query: () => "visitor-tracking/statistics",
      providesTags: ["Visitors"],
    }),
    
    // Geography endpoints
    getGeography: build.query({
      query: () => "visitor-tracking/geography",
      providesTags: ["Geography"]
    }),
    
    // Card endpoints
    getCards: build.query({
      query: () => "card-system",
      providesTags: ["Cards"],
    }),
    getCard: build.query({
      query: (id) => `card-system/${id}`,
      providesTags: (result, error, id) => [{ type: "Cards", id }],
    }),
    uploadCardImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading card image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "card-system/upload-image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createCard: build.mutation({
      query: (data) => ({
        url: "card-system",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cards"],
    }),
    updateCard: build.mutation({
      query: ({ id, ...data }) => ({
        url: `card-system/${id}`,
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
        url: `card-system/${id}`,
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
