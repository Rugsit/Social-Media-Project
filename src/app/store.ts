import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/authSlice";
import postSlice from "../features/postSlice";
import commentSlice from "../features/commentsSlice";
import communitySlice from "../features/community";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,
    comment: commentSlice,
    community: communitySlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
