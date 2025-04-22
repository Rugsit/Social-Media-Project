import { FieldError, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { addPost } from "../features/postSlice";
import { useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabase-client";

export type CreatePostType = {
  id: string;
  title: string;
  content: string;
  image_url: string;
  author_img_url: string;
  community_id: string;
};

export default function CreatePost() {
  const {
    register,
    handleSubmit,
    watch,
    formState,
    reset,
    setError,
    formState: { errors },
  } = useForm();
  const currentUser: User | null = useSelector(
    (state: RootState) => state.auth.user
  );
  const navigate = useNavigate();
  const addPostStatus = useSelector((state: RootState) => state.post.status);
  const dispatch = useDispatch<AppDispatch>();
  const onSubmit = async () => {
    const imageFile: File = watch("image") && watch("image")[0];
    if (currentUser === null) {
      setError("form", {
        type: "manual",
        message: "You can't create a post before sign in.",
      });
      return;
    }
    const response = await supabase
      .from("join")
      .select("*")
      .eq("user_id", currentUser!.id)
      .maybeSingle();
    if (response.data?.length === 0 || response.data === null) {
      setError("form", {
        type: "manual",
        message: "You can't create a post before joining the community.",
      });
      return;
    }
    const community_id = response.data!.community_id;
    console.log(community_id);
    const newPost: CreatePostType = {
      id: uuidv4(),
      title: watch("title"),
      content: watch("content"),
      image_url: imageFile ? imageFile.name : "",
      author_img_url: currentUser?.user_metadata.avatar_url,
      community_id: community_id,
    };
    try {
      await dispatch(addPost({ newPost: newPost, imageFile: imageFile }));
    } catch (error) {}
    navigate("/home", { state: { refresh: true } });
  };

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ title: "", content: "", image: "" });
    }
  }, [formState, reset]);
  return (
    <>
      <div className="flex justify-center flex-col items-center flex-1 gap-4">
        <p className="text-4xl mx-auto w-fit font-bold text-[#242424]">
          Create new post
        </p>
        <form
          className="flex flex-col w-full max-w-[400px] mx-auto gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="text-[18px]">Title</p>
          <input
            {...register("title", { required: true })}
            className="border-2 border-gray-200 px-2 py-3 text-[18px] rounded-lg focus:outline-gray-400 "
          />
          {errors.title && (
            <p className="text-red-400">You must enter some text in title</p>
          )}

          <p className="text-[18px]">Content</p>
          <textarea
            {...register("content", { required: true })}
            className="border-2 border-gray-200 h-[150px] rounded-lg px-2 py-3 focus:outline-gray-400 resize-none text-[18px]"
          />
          {errors.content && (
            <p className="text-red-400">You must enter some text in content</p>
          )}
          <p className="text-[18px]">Upload image</p>
          <div className="flex gap-3 items-center">
            <label className="bg-blue-400 py-2 px-3.5 rounded-lg cursor-pointer text-white transition-all hover:scale-95 active:bg-blue-500">
              <input
                type="file"
                {...register("image", { required: true })}
                className="hidden"
              />
              Upload Image
            </label>
            <p>
              {watch("image") != undefined
                ? watch("image")[0] != undefined
                  ? watch("image")[0].name
                  : "Please choose an image"
                : "Please choose an image"}
            </p>
          </div>
          {errors.image && (
            <p className="text-red-400">You must choose post image</p>
          )}
          {errors.form && (
            <p className="text-red-400">
              {(errors.form as FieldError)?.message}
            </p>
          )}

          <button
            type="submit"
            disabled={addPostStatus === "PENDING"}
            className="bg-green-400 py-2 px-3.5 rounded-lg text-white cursor-pointer transition-all hover:scale-95 active:bg-green-500"
          >
            {addPostStatus === "PENDING" ? "Create Post..." : "Create Post"}
          </button>
        </form>
      </div>
    </>
  );
}
