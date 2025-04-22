import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../supabase-client";

export type CommentType = {
  created_at: Date;
  author_username: string;
  author_email: string;
  reply_id: string;
  post_id: string;
  id: string;
  content: string;
};

interface CommentState {
  comments: CommentType[];
}

const initialState: CommentState = {
  comments: [],
};

export const fetchCommentsByPostId = createAsyncThunk(
  "comment/fetchCommentsByPostId",
  async (post_id: string) => {
    const response = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post_id)
      .is("reply_id", null)
      .order("created_at", { ascending: false });
    if (response.error) {
      throw new Error("Failed to fetch comment by post id.");
    }
    return response.data;
  }
);

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCommentsByPostId.fulfilled, (state, action) => {
      state.comments = action.payload;
    });
  },
});

export default commentSlice.reducer;
