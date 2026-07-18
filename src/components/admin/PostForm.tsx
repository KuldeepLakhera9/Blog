"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createPost, updatePost } from "@/app/admin/actions";
import { TiptapEditor } from "@/components/admin/Editor";
import { slugify } from "@/lib/utils";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const postFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean(),
  categoryId: z.string().nullable().optional(),
  tagsInput: z.string(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface PostFormProps {
  categories: { id: string; name: string }[];
  initialPost?: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    published: boolean;
    categoryId: string | null;
    tags: { name: string }[];
  };
}

export function PostForm({ categories, initialPost }: PostFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultTags = initialPost?.tags.map((t) => t.name).join(", ") || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialPost?.title || "",
      slug: initialPost?.slug || "",
      summary: initialPost?.summary || "",
      content: initialPost?.content || "",
      published: initialPost?.published || false,
      categoryId: initialPost?.categoryId || "",
      tagsInput: defaultTags,
    },
  });

  const watchTitle = watch("title");
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-generate slug from title if slug hasn't been manually edited
  useEffect(() => {
    if (!initialPost && watchTitle && !slugTouched) {
      setValue("slug", slugify(watchTitle), { shouldValidate: true });
    }
  }, [watchTitle, setValue, slugTouched, initialPost]);

  const onSubmit = async (values: PostFormValues) => {
    setError(null);
    const tags = values.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      content: values.content,
      published: values.published,
      categoryId: values.categoryId || null,
      tags,
    };

    startTransition(async () => {
      try {
        if (initialPost) {
          await updatePost(initialPost.id, payload);
        } else {
          await createPost(payload);
        }
        router.push("/admin/posts");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Failed to save post. Ensure the slug is unique.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-805 dark:bg-neutral-900 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Post Title
              </label>
              <input
                type="text"
                {...register("title")}
                className="mt-1 block w-full rounded-lg border border-neutral-350 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
                placeholder="Enter title here..."
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Slug
              </label>
              <input
                type="text"
                {...register("slug")}
                onChange={(e) => {
                  setSlugTouched(true);
                  register("slug").onChange(e);
                }}
                className="mt-1 block w-full rounded-lg border border-neutral-350 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
                placeholder="post-url-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Summary
              </label>
              <textarea
                {...register("summary")}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-neutral-350 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
                placeholder="Write a short summary..."
              />
              {errors.summary && (
                <p className="mt-1 text-xs text-red-500">{errors.summary.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 px-1">
              Body Content
            </label>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TiptapEditor content={field.value} onChange={field.onChange} />
              )}
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-500 px-1">{errors.content.message}</p>
            )}
          </div>
        </div>

        {/* Sidebar Configuration Section */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-805 dark:bg-neutral-900 space-y-5">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Publishing Options
            </h3>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Category
              </label>
              <select
                {...register("categoryId")}
                className="mt-1 block w-full rounded-lg border border-neutral-350 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                {...register("tagsInput")}
                placeholder="tech, writing, tutorial"
                className="mt-1 block w-full rounded-lg border border-neutral-350 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                id="published"
                type="checkbox"
                {...register("published")}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950 dark:border-neutral-700 dark:focus:ring-neutral-50"
              />
              <label
                htmlFor="published"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                Publish immediately
              </label>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {initialPost ? "Save Changes" : "Create Post"}
              </button>

              <Link
                href="/admin/posts"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
