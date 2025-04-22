import { Session } from "@supabase/supabase-js";
import { AppDispatch, RootState } from "./app/store";
import { supabase } from "./supabase-client";
import { Store } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { setUser } from "./features/authSlice";

export const listenToAuthChanges = (store: Store<RootState>) => {
  supabase.auth.onAuthStateChange((event, session: Session | null) => {
    store.dispatch(setUser(session?.user || null));
  });
};
