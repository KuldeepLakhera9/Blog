"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, deleteTag } from "@/app/admin/actions";
import { Plus, Trash2, FolderOpen, Tag, Loader2 } from "lucide-react";

interface Item {
  id: string;
  name: string;
  slug: string;
  _count: {
    posts: number;
  };
}

interface CategoryTagManagerProps {
  initialCategories: Item[];
  initialTags: Item[];
}

export function CategoryTagManager({
  initialCategories,
  initialTags,
}: CategoryTagManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Item[]>(initialCategories);
  const [tags, setTags] = useState<Item[]>(initialTags);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      try {
        const created = await createCategory(newCategoryName);
        setCategories((prev) => [
          ...prev,
          { ...created, _count: { posts: 0 } },
        ].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategoryName("");
        router.refresh();
      } catch (err) {
        alert("Failed to create category. Make sure it is unique.");
      }
    });
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? posts in this category will be uncategorized.")) return;
    setActionId(id);
    startTransition(async () => {
      try {
        await deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      } catch (err) {
        alert("Failed to delete category");
      } finally {
        setActionId(null);
      }
    });
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    setActionId(id);
    startTransition(async () => {
      try {
        await deleteTag(id);
        setTags((prev) => prev.filter((t) => t.id !== id));
        router.refresh();
      } catch (err) {
        alert("Failed to delete tag");
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
          Categories & Tags
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Organize your posts and manage taxonomy systems.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Categories Section */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-850 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
              <FolderOpen className="h-5 w-5 text-neutral-500" />
              <h2>Categories</h2>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New Category Name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={isPending}
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-955 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
              />
              <button
                type="submit"
                disabled={isPending || !newCategoryName.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors"
              >
                {isPending && !actionId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </button>
            </form>

            {/* Categories List */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[400px] overflow-y-auto">
              {categories.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">
                  No categories created yet.
                </p>
              ) : (
                categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors px-1"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {c.name}
                      </span>
                      <span className="text-xs text-neutral-450 dark:text-neutral-500">
                        {c._count.posts} posts • /{c.slug}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      disabled={isPending}
                      className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {isPending && actionId === c.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-850 dark:bg-neutral-900 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
              <Tag className="h-5 w-5 text-neutral-500" />
              <h2>Tags</h2>
            </div>
            <p className="text-xs text-neutral-400">
              Tags are automatically created when you write posts. Manage them here.
            </p>

            {/* Tags List */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[464px] overflow-y-auto">
              {tags.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">
                  No tags created yet.
                </p>
              ) : (
                tags.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10 transition-colors px-1"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-neutral-900 dark:text-white">
                        #{t.name}
                      </span>
                      <span className="text-xs text-neutral-450 dark:text-neutral-500">
                        {t._count.posts} posts • /{t.slug}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteTag(t.id)}
                      disabled={isPending}
                      className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {isPending && actionId === t.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
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
