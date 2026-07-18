import React from "react";
import { prisma } from "@/lib/db";
import { PostForm } from "@/components/admin/PostForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch categories for form:", error);
  }

  return (
    <div className="space-y-8">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/posts"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Create New Post</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Write and configure a new article for your blog.
          </p>
        </div>
      </div>

      <PostForm categories={categories} />
    </div>
  );
}
