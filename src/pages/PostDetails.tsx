import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { AppDispatch, RootState } from "../app/store";
import { useEffect, useState } from "react";
import {
  addComment,
  fetchPostById,
  updateVotingStatus,
} from "../features/postSlice";
import { Dislike, DropDown, Like } from "../components/Icon";
import clsx from "clsx";
import { supabase } from "../supabase-client";
import { useForm } from "react-hook-form";
import { fetchCommentsByPostId } from "../features/commentsSlice";
import Comment from "../components/Comment";
import AllComments from "../components/AllComments";

export default function PostDetais() {
  const {
    register,
    handleSubmit,
    watch,
    formState,
    reset,
    formState: { errors },
  } = useForm();
  const [votingStatus, setVotingStatus] = useState("NONE"); // NONE LIKE DISLIKE
  const [totalVoting, setTotalVoting] = useState<{
    like: number;
    dislike: number;
  }>({ like: 0, dislike: 0 });
  const { id } = useParams();
  const currentPost = useSelector((state: RootState) => state.post.currentPost);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const comments = useSelector((state: RootState) => state.comment.comments);
  const dispatch = useDispatch<AppDispatch>();

  const onSubmitFormComment = async () => {
    await dispatch(
      addComment({
        post_id: id!,
        author_username: currentUser?.user_metadata.name,
        author_email: currentUser?.email!,
        reply_id: null,
        content: watch("comment"),
      })
    );
    dispatch(fetchCommentsByPostId(id!));
  };

  useEffect(() => {
    if (currentPost !== null) {
      setTotalVoting({
        like: currentPost!.like,
        dislike: currentPost!.dislike,
      });
    }
  }, [currentPost]);

  useEffect(() => {
    const fetchData = async () => {
      if (id != undefined) {
        await dispatch(fetchPostById(id));
        await dispatch(fetchCommentsByPostId(id));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ comment: "" });
    }
  }, [formState, reset]);

  useEffect(() => {
    const fetchVotingStatus = async () => {
      const response = await supabase
        .from("like")
        .select("*")
        .eq("user_id", currentUser!.id)
        .eq("post_id", id)
        .maybeSingle();
      const votingFromResponse =
        response.data === null
          ? "NONE"
          : response.data["like"]
          ? "LIKE"
          : "DISLIKE";
      setVotingStatus(votingFromResponse);
    };
    if (currentUser != null) {
      fetchVotingStatus();
    }
  }, [currentUser?.id, id]);

  return (
    <>
      <div className="pt-8 max-w-[1500px] w-full mx-auto pb-8 px-10">
        <p className="text-4xl font-bold text-center text-blue-400">
          {currentPost?.title}
        </p>
        <img
          src={currentPost?.image_url}
          className="w-full  object-cover rounded-lg mt-6"
        />
        <p className="text-[18px] font-medium mt-3">{currentPost?.content}</p>
        <div className="flex gap-3 mt-6">
          <button
            className={clsx(
              "px-6 py-3 rounded-lg  cursor-pointer outline-none hover:scale-95 transition-all flex gap-4 items-center",
              {
                "bg-gray-500":
                  votingStatus === "NONE" || votingStatus === "DISLIKE",
                "bg-blue-400": votingStatus === "LIKE",
              }
            )}
            onClick={() => {
              if (votingStatus === "LIKE") {
                setVotingStatus("NONE");
                setTotalVoting({
                  ...totalVoting,
                  like: totalVoting.like - 1,
                });
              } else if (votingStatus === "DISLIKE") {
                setVotingStatus("LIKE");
                setTotalVoting({
                  like: totalVoting.like + 1,
                  dislike: totalVoting.dislike - 1,
                });
              } else {
                setVotingStatus("LIKE");
                setTotalVoting({
                  ...totalVoting,
                  like: totalVoting.like + 1,
                });
              }
              dispatch(
                updateVotingStatus({
                  post_id: id!,
                  user_id: currentUser!.id,
                  like: true,
                })
              );
            }}
          >
            <Like width={30} height={30} fill="#ffffff" />
            <p className="text-lg text-white font-medium">{totalVoting.like}</p>
          </button>
          <button
            className={clsx(
              "px-6 py-3 rounded-lg bg-gray-500 cursor-pointer outline-none hover:scale-95 transition-all flex gap-4 items-center",
              {
                "bg-gray-500":
                  votingStatus === "NONE" || votingStatus === "LIKE",
                "bg-red-400": votingStatus === "DISLIKE",
              }
            )}
            onClick={() => {
              if (votingStatus === "DISLIKE") {
                setTotalVoting({
                  ...totalVoting,
                  dislike: totalVoting.dislike - 1,
                });
                setVotingStatus("NONE");
              } else if (votingStatus === "LIKE") {
                setTotalVoting({
                  dislike: totalVoting.dislike + 1,
                  like: totalVoting.like - 1,
                });
                setVotingStatus("DISLIKE");
              } else {
                setTotalVoting({
                  ...totalVoting,
                  dislike: totalVoting.dislike + 1,
                });
                setVotingStatus("DISLIKE");
              }
              dispatch(
                updateVotingStatus({
                  post_id: id!,
                  user_id: currentUser!.id,
                  like: false,
                })
              );
            }}
          >
            <Dislike width={30} height={30} fill="#ffffff" />
            <p className="text-lg text-white font-medium">
              {totalVoting.dislike}
            </p>
          </button>
        </div>
        <div className="flex flex-col">
          <form onSubmit={handleSubmit(onSubmitFormComment)} key="mainForm">
            <p className="text-2xl font-bold mb-4 mt-10">Comments</p>
            <textarea
              {...register("comment", { required: true })}
              placeholder="Write a comment..."
              className="w-full resize-none border-2 border-gray-300  focus:outline-gray-500 rounded-lg p-4 h-[150px]"
            />
            {errors.comment ? (
              <p className="text-red-400">
                Please enter some text before post comment.
              </p>
            ) : (
              ""
            )}
            <button
              type="submit"
              className="bg-blue-400 rounded-lg px-4 py-2 hover:scale-95 transition-all text-white cursor-pointer w-fit mt-4 active:bg-blue-500"
            >
              Post Comment
            </button>
          </form>
          <div className="mt-7 ml-6 flex flex-col gap-6">
            {comments.map((item, index) => {
              return (
                <AllComments
                  item={item}
                  index={index}
                  postId={id!}
                  key={index}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
