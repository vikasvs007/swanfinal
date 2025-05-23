import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "dark",
  userId: "", // Clean userId without any special characters
  user: null,
  token: null, // Add token field to track authentication
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    // Add a logout action that clears user and token
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setMode, setUser, setUserId, setToken, logout } = globalSlice.actions;

export default globalSlice.reducer;
