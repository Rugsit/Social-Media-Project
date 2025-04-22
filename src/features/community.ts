import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../supabase-client";
import { v4 as uuidv4 } from "uuid";

export type CommunityType = {
  id: string;
  created_at: Date;
  name: string;
  description: string;
};

interface CommunityState {
  community: CommunityType[];
  status: string;
}

const initialState: CommunityState = {
  community: [],
  status: "FULFILLED",
};

export const fetchCommunities = createAsyncThunk(
  "community/fetchCommunities",
  async () => {
    const response = await supabase.from("community").select("*");
    if (response.error) {
      throw new Error("Failed to fetch comment by post id.");
    }
    return response.data;
  }
);

export const addCommunity = createAsyncThunk(
  "community/addCommunity",
  async (data: { name: string; description: string }) => {
    await supabase.from("community").insert({
      id: uuidv4(),
      name: data.name,
      description: data.description,
    });
  }
);

export const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.community = action.payload;
      })
      .addCase(addCommunity.fulfilled, (state) => {
        state.status = "FULLFILLED";
      })
      .addCase(addCommunity.pending, (state) => {
        state.status = "PENDING";
      });
  },
});

export default communitySlice.reducer;
