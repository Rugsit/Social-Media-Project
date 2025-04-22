import { useEffect, useState } from "react";
import Comment from "./Comment";
import { CommentType } from "../features/commentsSlice";
import { supabase } from "../supabase-client";
import { DropDown } from "./Icon";

export default function AllComments({
  item,
  index,
  postId,
}: {
  item: CommentType;
  index: number;
  postId: string;
}) {
  const [replyComments, setReplyComments] = useState<CommentType[]>([]);
  const [openTargetReplyComment, setOpenTargetReplyComment] = useState({
    id: 0,
    status: false,
  });

  useEffect(() => {
    fetchReplyCommentById(item.id);
  }, []);

  const fetchReplyCommentById = async (commentId: string) => {
    const response = await supabase
      .from("comments")
      .select("*")
      .eq("reply_id", commentId);
    if (response.error != null) {
      throw new Error("Failed to fetch reply comment");
    }
    setReplyComments(response.data);
  };
  return (
    <>
      <div key={index}>
        <Comment
          item={item}
          index={index}
          id={postId!}
          key={index}
          fetchReplyComment={fetchReplyCommentById}
        />
        <button
          onClick={async () => {
            setOpenTargetReplyComment({
              id: index,
              status: !openTargetReplyComment.status,
            });
            await fetchReplyCommentById(item.id);
          }}
        >
          <DropDown
            width={20}
            height={20}
            fill="#2a7eff"
            className={
              "cursor-pointer transition-all " +
              (openTargetReplyComment.id === index &&
              openTargetReplyComment.status
                ? " rotate-180"
                : "") +
              (replyComments.length === 0 ? " hidden" : "")
            }
          />
        </button>
        <div
          className={
            "transition-all flex flex-col gap-6 ml-6 " +
            (openTargetReplyComment.id === index &&
            openTargetReplyComment.status
              ? ""
              : " hidden")
          }
        >
          {replyComments.map((item: CommentType, index) => {
            return (
              <Comment
                item={item}
                index={index}
                id={postId!}
                key={index}
                fetchReplyComment={fetchReplyCommentById}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
