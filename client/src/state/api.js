import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BASE_URL ,
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
      query: (id) => `api/users/${id}`,
      providesTags: ["User"],
    }),
    getUsers: build.query({
      query: () => "api/users",
      providesTags: ["User"],
    }),
    createUser: build.mutation({
      query: (data) => ({
        url: "api/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation({
      query: (id) => ({
        url: `api/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    uploadPhoto: build.mutation({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append("photo", photo);
        return {
          url: `api/users/${id}/photo`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["User"],
    }),
    
    // Blog endpoints
    getBlogs: build.query({
      query: ({ status, category, featured, search, limit, page } = {}) => {
        let url = 'api/blogs?';
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
      query: (id) => `api/blogs/${id}`,
      providesTags: (result, error, id) => [{ type: "Blogs", id }],
    }),
    getBlogBySlug: build.query({
      query: (slug) => `api/blogs/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Blogs", slug }],
    }),
    getBlogCategories: build.query({
      query: () => "api/blogs/categories",
      providesTags: ["Blogs"],
    }),
    getBlogTags: build.query({
      query: () => "api/blogs/tags",
      providesTags: ["Blogs"],
    }),
    uploadBlogImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "api/blogs/upload-image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createBlog: build.mutation({
      query: (data) => ({
        url: "api/blogs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/blogs/${id}`,
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
        url: `api/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Blogs"],
    }),
    
    // Product endpoints
    getProducts: build.query({
      query: () => "api/products",
      providesTags: ["Products"],
    }),
    createProduct: build.mutation({
      query: (data) => ({
        url: "api/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
    
    // Order endpoints
    getOrders: build.query({
      query: () => "api/orders",
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: (data) => ({
        url: "api/orders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrder: build.mutation({
      query: ({ id, data }) => ({
        url: `api/orders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),
    deleteOrder: build.mutation({
      query: (id) => ({
        url: `api/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
    
    // Enquiry endpoints
    getEnquiries: build.query({
      query: () => "api/enquiries",
      providesTags: ["Enquiries"],
    }),
    createEnquiry: build.mutation({
      query: (data) => ({
        url: "api/enquiries",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    updateEnquiry: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/enquiries/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Enquiries"],
    }),
    deleteEnquiry: build.mutation({
      query: (id) => ({
        url: `api/enquiries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enquiries"],
    }),
    
    // Notification endpoints
    getNotifications: build.query({
      query: () => "api/notifications",
      providesTags: ["Notifications"],
      pollingInterval: 30000,
    }),
    createNotification: build.mutation({
      query: (data) => ({
        url: "api/notifications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    updateNotification: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/notifications/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),
    
    // Active Users endpoints
    getActiveUsers: build.query({
      query: () => "api/active-users",
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
      query: () => "api/visitors",
      providesTags: ["Visitors"],
      pollingInterval: 30000,
    }),
    createVisitor: build.mutation({
      query: (data) => ({
        url: "api/visitors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Visitors"],
    }),
    updateVisitor: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/visitors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Visitors", "Geography"],
    }),
    deleteVisitor: build.mutation({
      query: (id) => ({
        url: `api/visitors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Visitors"],
    }),
    
    // User Statistics endpoints
    getUserStatistics: build.query({
      query: () => "api/user-statistics/overall",
      providesTags: ["UserStatistics"],
    }),
    
    getActiveUserStats: build.query({
      query: () => "api/active-users/statistics",
      providesTags: ["ActiveUsers"],
    }),
    
    getVisitorStats: build.query({
      query: () => "api/visitors/statistics",
      providesTags: ["Visitors"],
    }),
    
    // Geography endpoints
    getGeography: build.query({
      query: () => "api/visitors/geography",
      providesTags: ["Geography"]
    }),
    
    // Card endpoints
    getCards: build.query({
      query: () => "api/cards",
      providesTags: ["Cards"],
    }),
    getCard: build.query({
      query: (id) => `api/cards/${id}`,
      providesTags: (result, error, id) => [{ type: "Cards", id }],
    }),
    uploadCardImage: build.mutation({
      query: (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        console.log('Uploading card image file:', imageFile.name, imageFile.type, imageFile.size);
        return {
          url: "api/cards/upload-image",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
    }),
    createCard: build.mutation({
      query: (data) => ({
        url: "api/cards",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cards"],
    }),
    updateCard: build.mutation({
      query: ({ id, ...data }) => ({
        url: `api/cards/${id}`,
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
        url: `api/ cards/${id}`,
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
