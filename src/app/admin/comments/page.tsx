import React from "react";
import { prisma } from "@/lib/db";
import { CommentModerator } from "@/components/admin/CommentModerator";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  let comments: any[] = [];

  try {
    comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: { title: true, slug: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch comments for moderator page:", error);
  }

  return (
    <div className="space-y-8">
      <CommentModerator initialComments={comments} />
    </div>
  );
}
