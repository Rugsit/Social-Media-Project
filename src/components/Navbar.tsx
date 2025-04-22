import { Link } from "react-router";
import { supabase } from "../supabase-client";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { logout, setUser } from "../features/authSlice";
import { Session, User } from "@supabase/supabase-js";

export default function Navbar() {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser: User | null = useSelector(
    (state: RootState) => state.auth.user
  );
  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
    });
  }

  supabase.auth.onAuthStateChange((event, session: Session | null) => {
    dispatch(setUser(session?.user || null));
  });

  return (
    <>
      <div className="bg-[#242424]  w-full">
        <div className="flex justify-between w-[80%] mx-auto text-white py-4 items-center">
          <p className="font-bold text-xl">
            forum<span className="text-blue-400">.app</span>
          </p>
          <div className="flex gap-6 items-center">
            <Link to={"/home"} className="hover:underline ">
              Home
            </Link>
            <Link to={"/createpost"} className="hover:underline ">
              Create Post
            </Link>
            <Link to={"/communities"} className="hover:underline ">
              Communities
            </Link>
            <Link to={"/createcommunity"} className="hover:underline ">
              Create Commuity
            </Link>
          </div>
          {currentUser == null ? (
            <button
              className="bg-blue-400 rounded-lg px-3 py-2 cursor-pointer hover:scale-95 transition-all"
              onClick={() => {
                signInWithGithub();
              }}
            >
              Sign in with Github
            </button>
          ) : (
            <div className="flex gap-5 items-center">
              <p>{currentUser.email}</p>
              <img
                src={currentUser.user_metadata.avatar_url}
                className="w-[50px] rounded-full"
              ></img>
              <button
                className="bg-red-500 rounded-lg py-2 px-4 cursor-pointer transition-all hover:scale-95"
                onClick={() => {
                  dispatch(logout());
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
