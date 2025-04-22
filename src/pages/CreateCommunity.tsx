import { FieldError, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { addCommunity } from "../features/community";

export default function CreateCommunity() {
  const {
    register,
    handleSubmit,
    watch,
    formState,
    reset,
    setError,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const addCommunityStatus = useSelector(
    (state: RootState) => state.community.status
  );
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const onSubmit = async () => {
    try {
      if (currentUser === null) {
        setError("form", {
          type: "manual",
          message: "You can't create a community before sign in.",
        });
      }
      await dispatch(
        addCommunity({ name: watch("name"), description: watch("description") })
      );
      return;
    } catch (error) {}
    navigate("/communities", { state: { refresh: true } });
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
          Create new community
        </p>
        <form
          className="flex flex-col w-full max-w-[400px] mx-auto gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="text-[18px]">Community Name</p>
          <input
            {...register("name", { required: true })}
            className="border-2 border-gray-200 px-2 py-3 text-[18px] rounded-lg focus:outline-gray-400"
          />
          {errors.name && (
            <p className="text-red-400">You must enter some community name</p>
          )}

          <p className="text-[18px]">Description</p>
          <textarea
            {...register("description", { required: true })}
            className="border-2 border-gray-200 h-[150px] rounded-lg px-2 py-3 focus:outline-gray-400 resize-none text-[18px]"
          />
          {errors.description && (
            <p className="text-red-400">
              You must enter some text in description
            </p>
          )}
          {errors.form && (
            <p className="text-red-400">
              {(errors.form as FieldError)?.message}
            </p>
          )}

          <button
            type="submit"
            disabled={addCommunityStatus === "PENDING"}
            className="bg-green-400 py-2 px-3.5 rounded-lg text-white cursor-pointer transition-all hover:scale-95 active:bg-green-500"
          >
            {addCommunityStatus === "PENDING"
              ? "Create Community..."
              : "Create Community"}
          </button>
        </form>
      </div>
    </>
  );
}
