import React from "react";
import { prisma } from "@/lib/db";
import { AdminPostList } from "@/components/admin/PostList";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch posts for admin list:", error);
  }

  return (
    <div className="space-y-8">
      <AdminPostList initialPosts={posts} />
    </div>
  );
}
