import { useForm } from "react-hook-form";
import { CommentType } from "../features/commentsSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { addComment } from "../features/postSlice";

export default function Comment({
  item,
  index,
  id,
  fetchReplyComment,
}: {
  item: CommentType;
  index: number;
  id: string;
  fetchReplyComment: (commentId: string) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    formState,
  } = useForm();
  const registerName = `comment_${index}`;
  const dateComment: Date = new Date(item.created_at);
  const [openReplyTextField, setOpenReplyTextField] = useState({
    id: 0,
    status: false,
  });

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ comment: "" });
      setOpenReplyTextField({ ...openReplyTextField, status: false });
    }
  }, [formState, reset]);

  const onSubmitFormComment = async (
    reply_id: string,
    targetTextField: string
  ) => {
    if (item.reply_id != null) {
      await dispatch(
        addComment({
          post_id: id!,
          author_username: currentUser!.user_metadata.name,
          reply_id: item.reply_id,
          author_email: currentUser?.email!,
          content: watch(targetTextField),
        })
      );
      fetchReplyComment(item.reply_id);
    } else {
      await dispatch(
        addComment({
          post_id: id!,
          author_username: currentUser!.user_metadata.name,
          reply_id: reply_id,
          author_email: currentUser?.email!,
          content: watch(targetTextField),
        })
      );
      fetchReplyComment(item.id);
    }
  };

  return (
    <div key={index} className="flex flex-col gap-2 w-fit">
      <div className="flex gap-3 text-sm">
        <p className="font-bold text-blue-400">{item.author_username}</p>
        <p className="text-gray-500">{`${dateComment.getMonth()}/${dateComment.getDay()}/${dateComment.getFullYear()}, ${dateComment.getHours()}:${dateComment.getMinutes()}:${dateComment.getSeconds()}`}</p>
      </div>
      <p>{item.content}</p>
      <form
        key={index}
        onSubmit={handleSubmit(() => {
          onSubmitFormComment(item.id, registerName);
        })}
        className={
          "" +
          (openReplyTextField.id == index && openReplyTextField.status
            ? " "
            : "hidden")
        }
      >
        <button
          type="button"
          className="text-sm text-red-400 cursor-pointer mb-3"
          onClick={() => {
            setOpenReplyTextField({ id: index, status: false });
          }}
        >
          Cancel
        </button>
        <textarea
          defaultValue={
            item.reply_id !== null ? `@${item.author_username}` : ""
          }
          {...register(registerName, { required: true })}
          placeholder="Write a comment..."
          className="w-full resize-none border-2 border-gray-300  focus:outline-gray-500 rounded-lg p-4 h-[150px]"
        />
        {errors[registerName] ? (
          <p className="text-red-400">
            Please enter some text before post comment.
          </p>
        ) : (
          ""
        )}
        <button
          type="submit"
          className="bg-blue-400 rounded-lg px-3 py-1 hover:scale-95 transition-all text-white cursor-pointer w-fit mt-2 active:bg-blue-500 text-sm"
        >
          Post Comment
        </button>
      </form>
      <button
        onClick={() => {
          setOpenReplyTextField({
            id: index,
            status: true,
          });
        }}
        className={
          "text-sm text-start text-blue-600 cursor-pointer" +
          (openReplyTextField.id == index && openReplyTextField.status
            ? " hidden"
            : "")
        }
      >
        Reply
      </button>
    </div>
  );
}
