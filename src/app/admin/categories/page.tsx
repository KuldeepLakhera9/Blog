import React from "react";
import { prisma } from "@/lib/db";
import { CategoryTagManager } from "@/components/admin/CategoryTagManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });

    tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch taxonomy for categories page:", error);
  }

  return (
    <div className="space-y-8">
      <CategoryTagManager
        initialCategories={categories}
        initialTags={tags}
      />
    </div>
  );
}
