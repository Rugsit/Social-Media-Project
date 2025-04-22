import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User } from "@supabase/supabase-js";
import { supabase } from "../supabase-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const setUser = createAsyncThunk(
  "auth/setUser",
  async (user: User | null) => {
    return user;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  await supabase.auth.signOut();
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = action.payload != null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
