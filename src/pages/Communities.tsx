import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { useEffect } from "react";
import { CommunityType, fetchCommunities } from "../features/community";
import { useNavigate } from "react-router";
import { supabase } from "../supabase-client";
import { v4 as uuidv4 } from "uuid";

export default function Communities() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const communities = useSelector(
    (state: RootState) => state.community.community
  );
  const currentUser = useSelector((stat: RootState) => stat.auth.user);

  const isJoinCommunity = async (): Promise<boolean> => {
    const response = await supabase
      .from("join")
      .select("*")
      .eq("user_id", currentUser!.id);
    if (response.data?.length === 0) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    dispatch(fetchCommunities());
  }, []);
  return (
    <>
      <div className="max-w-[1000px] w-full mx-auto">
        <p className="text-4xl text-center text-blue-400 font-bold mt-8 mb-10">
          Communities
        </p>
        <div className="flex flex-col gap-3">
          {communities.map((item: CommunityType) => {
            return (
              <button
                onClick={async () => {
                  if (currentUser == null) {
                    return;
                  }
                  if (await isJoinCommunity()) {
                    await supabase
                      .from("join")
                      .delete()
                      .eq("user_id", currentUser!.id);
                  }
                  await supabase.from("join").insert({
                    id: uuidv4(),
                    community_id: item.id,
                    user_id: currentUser!.id,
                  });
                  navigate("/home");
                }}
                key={item.id}
                className="border-2 border-gray-400 rounded-lg p-4 flex flex-col gap-3 transition-all hover:scale-95 cursor-pointer text-start"
              >
                <p className="text-2xl font-medium">{item.name}</p>
                <p className="text-[18px] text-gray-500">{item.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
