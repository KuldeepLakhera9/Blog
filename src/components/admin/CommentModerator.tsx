"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveComment, deleteComment } from "@/app/admin/actions";
import { Check, Trash2, MessageSquare, ExternalLink, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  approved: boolean;
  createdAt: Date | string;
  post: {
    title: string;
    slug: string;
  };
}

export function CommentModerator({ initialComments }: { initialComments: Comment[] }) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const pendingComments = comments.filter((c) => !c.approved);
  const approvedComments = comments.filter((c) => c.approved);

  const handleApprove = async (id: string) => {
    setActionId(id);
    startTransition(async () => {
      try {
        await approveComment(id);
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, approved: true } : c))
        );
        router.refresh();
      } catch (err) {
        alert("Failed to approve comment");
      } finally {
        setActionId(null);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    setActionId(id);
    startTransition(async () => {
      try {
        await deleteComment(id);
        setComments((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      } catch (err) {
        alert("Failed to delete comment");
      } finally {
        setActionId(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Comments
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Moderate visitor discussions and delete spam.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Moderation Queue */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-850 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-amber-500" />
                <h2>Pending Approval</h2>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                {pendingComments.length} pending
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[500px] overflow-y-auto space-y-4">
              {pendingComments.length === 0 ? (
                <p className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  Clean queue! No comments waiting for moderation.
                </p>
              ) : (
                pendingComments.map((comment) => (
                  <div key={comment.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                          {comment.authorName}
                        </span>{" "}
                        <span className="text-xs text-neutral-400">
                          ({comment.authorEmail})
                        </span>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          On post:{" "}
                          <span className="font-medium text-neutral-600 dark:text-neutral-300">
                            {comment.post.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleApprove(comment.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 dark:hover:text-green-400 transition-all"
                          title="Approve Comment"
                        >
                          {isPending && actionId === comment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all"
                          title="Delete Comment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-100 dark:border-neutral-850">
                      {comment.content}
                    </p>
                    <div className="text-xxs text-neutral-400 pl-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Approved Comments */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-850 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <h2>Approved Comments</h2>
              </div>
              <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-400">
                {approvedComments.length} active
              </span>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[500px] overflow-y-auto space-y-4">
              {approvedComments.length === 0 ? (
                <p className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                  No approved comments yet.
                </p>
              ) : (
                approvedComments.map((comment) => (
                  <div key={comment.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="font-semibold text-neutral-900 dark:text-white text-sm">
                          {comment.authorName}
                        </span>{" "}
                        <span className="text-xs text-neutral-400">
                          ({comment.authorEmail})
                        </span>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          On post:{" "}
                          <span className="font-medium text-neutral-600 dark:text-neutral-300">
                            {comment.post.title}
                          </span>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all"
                          title="Delete Comment"
                        >
                          {isPending && actionId === comment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-705 dark:text-neutral-350 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-100 dark:border-neutral-850">
                      {comment.content}
                    </p>
                    <div className="text-xxs text-neutral-400 pl-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
