import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboard() {
  let stats = {
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalCategories: 0,
    totalComments: 0,
    pendingComments: 0,
    totalSubscribers: 0,
    totalViews: 0,
  };

  let topPosts: any[] = [];

  try {
    const [
      postsCount,
      publishedPostsCount,
      categoriesCount,
      commentsCount,
      pendingCommentsCount,
      subscribersCount,
      postsViews,
      fetchedTopPosts,
    ] = await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.comment.count(),
      prisma.comment.count({ where: { approved: false } }),
      prisma.newsletterSubscriber.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.post.findMany({
        orderBy: { views: "desc" },
        take: 5,
        include: { category: true },
      }),
    ]);

    stats = {
      totalPosts: postsCount,
      publishedPosts: publishedPostsCount,
      draftPosts: postsCount - publishedPostsCount,
      totalCategories: categoriesCount,
      totalComments: commentsCount,
      pendingComments: pendingCommentsCount,
      totalSubscribers: subscribersCount,
      totalViews: postsViews._sum.views || 0,
    };
    topPosts = fetchedTopPosts;
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
  }

  const statCards = [
    { name: "Total Posts", value: stats.totalPosts, description: `${stats.publishedPosts} Published / ${stats.draftPosts} Drafts`, icon: FileText, href: "/admin/posts" },
    { name: "Categories", value: stats.totalCategories, description: "Structure your content", icon: FolderOpen, href: "/admin/categories" },
    { name: "Pending Comments", value: stats.pendingComments, description: `${stats.totalComments - stats.pendingComments} Approved comments`, icon: MessageSquare, href: "/admin/comments" },
    { name: "Subscribers", value: stats.totalSubscribers, description: "Newsletter subscribers", icon: Users, href: "/admin/subscribers" },
    { name: "Total Page Views", value: stats.totalViews, description: "Overall engagement", icon: Eye, href: "/admin/posts" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Overview of your blog content and subscriber engagement.
          </p>
        </div>
        <div>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-805 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="block rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:border-neutral-300 dark:border-neutral-805 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.name}</span>
              <card.icon className="h-5 w-5 text-neutral-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-x-2">
              <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* Top Posts Section */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-805 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Popular Posts</h2>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Manage posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {topPosts.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No posts written yet. Start by writing your first article!
            </div>
          ) : (
            topPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex flex-col gap-1 min-w-0 pr-4">
                  <span className="font-medium text-neutral-900 dark:text-white truncate">
                    {post.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{post.category?.name || "Uncategorized"}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className={post.published ? "text-green-500" : "text-amber-500"}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-sm text-neutral-500 dark:text-neutral-400">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
