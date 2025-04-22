import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../supabase-client";
import { CreatePostType } from "../pages/CreatePost";
import { v4 as uuidv4 } from "uuid";

type LikeType = {
  id: string;
  created_at: Date;
  user_id: string;
  post_id: string;
  like: boolean;
};

export type PostType = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  author_img_url: string;
  like: number;
  dislike: number;
};

interface PostState {
  posts: PostType[];
  currentPost: PostType | null;
  status: string;
}

const initialState: PostState = {
  posts: [],
  currentPost: null,
  status: "",
};

const getVotingAmount = async (id: string) => {
  const response = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  const currentPost = response.data;
  let responseLike = await supabase
    .from("like")
    .select("*")
    .eq("post_id", id)
    .eq("like", true);
  currentPost.like = responseLike.data != null ? responseLike.data?.length : 0;
  let responseDislike = await supabase
    .from("like")
    .select("*")
    .eq("post_id", id)
    .eq("like", false);
  currentPost.dislike =
    responseDislike.data != null ? responseDislike.data?.length : 0;
  return currentPost;
};

export const addComment = createAsyncThunk(
  "post/addComment",
  async (data: {
    post_id: string;
    author_username: string;
    reply_id: string | null;
    author_email: string;
    content: string;
  }) => {
    await supabase.from("comments").insert({
      author_username: data.author_username,
      author_email: data.author_email,
      reply_id: data.reply_id,
      post_id: data.post_id,
      id: uuidv4(),
      content: data.content,
    });
  }
);

export const updateVotingStatus = createAsyncThunk(
  "post/updateVotingStatus",
  async (data: { post_id: string; user_id: string; like: boolean }) => {
    const response = await supabase
      .from("like")
      .select("*")
      .eq("user_id", data.user_id)
      .eq("post_id", data.post_id)
      .maybeSingle();
    if (response.data == null) {
      await supabase.from("like").insert({
        user_id: data.user_id,
        like: data.like,
        post_id: data.post_id,
        id: uuidv4(),
      });
    } else {
      const targetLike: LikeType = response.data;
      if (targetLike.like === data.like) {
        await supabase.from("like").delete().eq("id", targetLike.id);
      } else {
        await supabase
          .from("like")
          .update({ like: data.like })
          .eq("id", targetLike.id);
      }
    }
  }
);

export const fetchPostById = createAsyncThunk(
  "post/fetchPostById",
  getVotingAmount
);

export const fetchPosts = createAsyncThunk(
  "post/fetchPosts",
  async (user_id: string) => {
    const responseCommunityJoin = await supabase
      .from("join")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
    const communityJoin = responseCommunityJoin.data.community_id;
    const response = await supabase
      .from("posts")
      .select("*")
      .eq("community_id", communityJoin);
    if (response.error != null) {
      throw new Error("Failed to fetch post from database");
    }
    const posts: PostType[] = response.data === null ? [] : response.data;
    const newPosts = await Promise.all(
      await posts.map(async (item: PostType) => {
        const newPost = await getVotingAmount(item.id);
        return newPost;
      })
    );
    return newPosts;
  }
);

export const addPost = createAsyncThunk(
  "post/addPost",
  async (newPost: { newPost: CreatePostType; imageFile: File }) => {
    const filePath = `${Date.now()}-${newPost.imageFile.name}`;
    const responseFromUploadImage = await supabase.storage
      .from("post-images")
      .upload(filePath, newPost.imageFile);
    if (responseFromUploadImage.error != null) {
      throw new Error("Failed to upload image to database");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(filePath);

    const responseFromInsertPost = await supabase
      .from("posts")
      .insert({ ...newPost.newPost, image_url: publicUrl });
    if (responseFromInsertPost.error != null) {
      throw new Error("Failed add new post to database");
    }
    return responseFromInsertPost.data;
  }
);

export const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.status = "FULFILLED";
        if (action.payload != null) {
          state.posts = [...state.posts, action.payload!];
        }
      })
      .addCase(addPost.pending, (state) => {
        state.status = "PENDING";
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
      });
  },
});

export default postSlice.reducer;
