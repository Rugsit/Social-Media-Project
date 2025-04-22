import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { fetchPosts, PostType } from "../features/postSlice";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Comments, Heart } from "../components/Icon";
import { supabase } from "../supabase-client";

export default function Home() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const posts: PostType[] = useSelector((state: RootState) => state.post.posts);
  const location = useLocation();
  const [totalComment, setTotalComment] = useState(0);

  useEffect(() => {
    if (location.state?.refresh && currentUser != null) {
      dispatch(fetchPosts(currentUser.id));
    }
  }, [location.state]);

  useEffect(() => {
    if (currentUser !== null) {
      dispatch(fetchPosts(currentUser.id));
    }
  }, [currentUser?.id]);

  const fetchAmountOfComment = async (postId: string) => {
    const response = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId);
    if (response.error != null) {
      throw new Error("Failed to fetch reply comment");
    }
    setTotalComment(response.data.length);
  };

  return (
    <>
      <div className="pt-8 pb-8">
        <p className="text-center text-4xl font-bold">Recent posts</p>
        <div className="flex flex-wrap gap-5 w-full max-w-[1300px] mx-auto mt-7 justify-center">
          {posts.map((item, index) => {
            fetchAmountOfComment(item.id);
            return (
              <Link
                to={`/postdetails/${item.id}`}
                key={index}
                className="flex flex-col gap-3 border-2 border-gray-300 hover:border-blue-300 rounded-lg p-5 w-full max-w-[300px] transition-all hover:scale-95 cursor-pointer hover:shadow-md hover:shadow-blue-300/50"
              >
                <div className="flex gap-2 items-center">
                  <img
                    src={item.author_img_url}
                    className="w-[30px] rounded-full"
                  />
                  <p className="text-[18px] font-medium">{item.title}</p>
                </div>
                <img
                  src={item.image_url}
                  className="h-[150px] w-full rounded-lg object-cover "
                />
                <div className="flex justify-center items-center gap-9">
                  <div className="flex items-center gap-3">
                    <Heart width={30} height={30} fill="#ed4e4e" />
                    <p className="font-medium">{item.like}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Comments width={30} height={30} fill="#4e90ed" />
                    <p className="font-medium">{totalComment}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
