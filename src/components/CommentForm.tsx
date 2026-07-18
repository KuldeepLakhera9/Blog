"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { submitComment } from "@/app/actions";
import { Loader2, MessageSquare } from "lucide-react";

const schema = z.object({
  authorName: z.string().min(1, "Name is required").max(100),
  authorEmail: z.string().email("Invalid email address"),
  content: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

type FormValues = z.infer<typeof schema>;

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      authorName: "",
      authorEmail: "",
      content: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setMessage(null);
    startTransition(async () => {
      const res = await submitComment({ ...values, postId });
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        reset();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
      <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <MessageSquare className="h-5 w-5 text-neutral-500" />
        <h3>Leave a Comment</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              {...register("authorName")}
              disabled={isPending}
              placeholder="Your Name"
              className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
            />
            {errors.authorName && (
              <p className="text-xs text-red-500 mt-1">{errors.authorName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Email (will not be published)
            </label>
            <input
              type="email"
              {...register("authorEmail")}
              disabled={isPending}
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
            />
            {errors.authorEmail && (
              <p className="text-xs text-red-500 mt-1">{errors.authorEmail.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Comment
          </label>
          <textarea
            {...register("content")}
            disabled={isPending}
            rows={4}
            placeholder="Write your comment here..."
            className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
          />
          {errors.content && (
            <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Comment
        </button>
      </form>

      {message && (
        <p
          className={`text-sm font-medium ${
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-505"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
