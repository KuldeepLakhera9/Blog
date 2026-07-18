"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { togglePublishPost, deletePost } from "@/app/admin/actions";
import { formatDateShort } from "@/lib/utils";
import {
  Edit2,
  Trash2,
  Eye,
  Plus,
  Search,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  views: number;
  createdAt: Date | string;
  category?: { name: string } | null;
}

export function AdminPostList({ initialPosts }: { initialPosts: any[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [isPending, startTransition] = useTransition();
  const [actionPostId, setActionPostId] = useState<string | null>(null);

  const handleTogglePublish = async (id: string) => {
    setActionPostId(id);
    startTransition(async () => {
      try {
        const updated = await togglePublishPost(id);
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, published: updated.published } : p))
        );
        router.refresh();
      } catch (err) {
        alert("Failed to toggle publish status");
      } finally {
        setActionPostId(null);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setActionPostId(id);
    startTransition(async () => {
      try {
        await deletePost(id);
        setPosts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } catch (err) {
        alert("Failed to delete post");
      } finally {
        setActionPostId(null);
      }
    });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && post.published) ||
      (statusFilter === "draft" && !post.published);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Posts</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your articles, drafts, and publication states.
          </p>
        </div>
        <div>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-3 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize border transition-all ${
                statusFilter === filter
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No posts found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      <div className="flex flex-col gap-0.5">
                        <span>{post.title}</span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 font-normal">
                          /{post.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                      {post.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-neutral-400" />
                        <span>{post.views}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(post.id)}
                        disabled={isPending}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                          post.published
                            ? "bg-green-50 text-green-705 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30"
                            : "bg-amber-50 text-amber-705 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                        }`}
                      >
                        {isPending && actionPostId === post.id ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : null}
                        {post.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                      {formatDateShort(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.published && (
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                            title="View Public Post"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                          title="Edit Post"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={isPending}
                          className="p-1.5 text-neutral-400 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
