import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BASE_URL || "https://swanbackend.onrender.com/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().global?.token;
      if (token) {
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
      query: (id) => ({
        url: `users/${id}`,
        method: "DELETE",
      }),
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
        let url = 'blogs?';
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
      query: (id) => `blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
    getBlogBySlug: build.query({
      query: (slug) => `blogs/slug/${slug}`,
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
          url: "blogs/upload-image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createBlog: build.mutation({
      query: (data) => ({
        url: "blogs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...data }) => ({
        url: `blogs/${id}`,
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
        url: `blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
    
    // Product endpoints
    getProducts: build.query({
      query: () => "products",
      providesTags: ["Products"],
    }),
    createProduct: build.mutation({
      query: (data) => ({
        url: "products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    
    // Order endpoints
    getOrders: build.query({
      query: () => "orders",
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: (data) => ({
        url: "orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrder: build.mutation({
      query: ({ id, data }) => ({
        url: `orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: build.mutation({
      query: (id) => ({
        url: `orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
    
    // Enquiry endpoints
    getEnquiries: build.query({
      query: () => "enquiries",
      providesTags: ["Enquiries"],
    }),
    createEnquiry: build.mutation({
      query: (data) => ({
        url: "enquiries",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    updateEnquiry: build.mutation({
      query: ({ id, ...data }) => ({
        url: `enquiries/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    deleteEnquiry: build.mutation({
      query: (id) => ({
        url: `enquiries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiries"],
    }),
    
    // Notification endpoints
    getNotifications: build.query({
      query: () => "notifications",
      providesTags: ["Notifications"],
      pollingInterval: 30000,
    }),
    createNotification: build.mutation({
      query: (data) => ({
        url: "notifications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    updateNotification: build.mutation({
      query: ({ id, ...data }) => ({
        url: `notifications/${id}`,
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
      query: () => "visitors",
      providesTags: ["Visitors"],
      pollingInterval: 30000,
    }),
    createVisitor: build.mutation({
      query: (data) => ({
        url: "visitors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Visitors"],
    }),
    updateVisitor: build.mutation({
      query: ({ id, ...data }) => ({
        url: `visitors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Visitors", "Geography"],
    }),
    deleteVisitor: build.mutation({
      query: (id) => ({
        url: `visitors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Visitors"],
    }),
    
    // User Statistics endpoints
    getUserStatistics: build.query({
      query: () => "user-statistics/overall",
      providesTags: ["UserStatistics"],
    }),
    
    getActiveUserStats: build.query({
      query: () => "active-users/statistics",
      providesTags: ["ActiveUsers"],
    }),
    
    getVisitorStats: build.query({
      query: () => "visitors/statistics",
      providesTags: ["Visitors"],
    }),
    
    // Geography endpoints
    getGeography: build.query({
      query: () => "visitors/geography",
      providesTags: ["Geography"]
    }),
    
    // Card endpoints
    getCards: build.query({
      query: () => "cards",
      providesTags: ["Cards"],
    }),
    getCard: build.query({
      query: (id) => `cards/${id}`,
      providesTags: (result, error, id) => [{ type: "Cards", id }],
    }),
    uploadCardImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading card image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "cards/upload-image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createCard: build.mutation({
      query: (data) => ({
        url: "cards",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cards"],
    }),
    updateCard: build.mutation({
      query: ({ id, ...data }) => ({
        url: `cards/${id}`,
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
        url: `cards/${id}`,
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
