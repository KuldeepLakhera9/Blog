"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";
import * as z from "zod";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
}

const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Content is required"),
  published: z.boolean().default(false),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export async function createPost(data: z.infer<typeof postSchema>) {
  await checkAdmin();
  const parsed = postSchema.parse(data);

  const post = await prisma.post.create({
    data: {
      title: parsed.title,
      slug: parsed.slug,
      summary: parsed.summary,
      content: parsed.content,
      published: parsed.published,
      categoryId: parsed.categoryId || null,
      tags: {
        connectOrCreate: parsed.tags.map((tagName) => {
          const slug = slugify(tagName);
          return {
            where: { slug },
            create: { name: tagName.trim(), slug },
          };
        }),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return post;
}

export async function updatePost(id: string, data: z.infer<typeof postSchema>) {
  await checkAdmin();
  const parsed = postSchema.parse(data);

  // Clear existing tags association first, then set new ones
  await prisma.post.update({
    where: { id },
    data: {
      tags: {
        set: [],
      },
    },
  });

  const post = await prisma.post.update({
    where: { id },
    data: {
      title: parsed.title,
      slug: parsed.slug,
      summary: parsed.summary,
      content: parsed.content,
      published: parsed.published,
      categoryId: parsed.categoryId || null,
      tags: {
        connectOrCreate: parsed.tags.map((tagName) => {
          const slug = slugify(tagName);
          return {
            where: { slug },
            create: { name: tagName.trim(), slug },
          };
        }),
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);
  revalidatePath("/admin/posts");
  return post;
}

export async function deletePost(id: string) {
  await checkAdmin();
  const post = await prisma.post.delete({
    where: { id },
  });
  revalidatePath("/");
  revalidatePath("/admin/posts");
  return post;
}

export async function togglePublishPost(id: string) {
  await checkAdmin();
  const current = await prisma.post.findUnique({
    where: { id },
    select: { published: true, slug: true },
  });
  if (!current) throw new Error("Post not found");

  const post = await prisma.post.update({
    where: { id },
    data: {
      published: !current.published,
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${current.slug}`);
  revalidatePath("/admin/posts");
  return post;
}

// Category Actions
export async function createCategory(name: string) {
  await checkAdmin();
  const slug = slugify(name);
  const category = await prisma.category.create({
    data: { name: name.trim(), slug },
  });
  revalidatePath("/admin/categories");
  return category;
}

export async function deleteCategory(id: string) {
  await checkAdmin();
  const category = await prisma.category.delete({
    where: { id },
  });
  revalidatePath("/admin/categories");
  return category;
}

export async function deleteTag(id: string) {
  await checkAdmin();
  const tag = await prisma.tag.delete({
    where: { id },
  });
  revalidatePath("/admin/categories");
  return tag;
}

// Comment Moderation Actions
export async function approveComment(id: string) {
  await checkAdmin();
  const comment = await prisma.comment.update({
    where: { id },
    data: { approved: true },
    include: { post: true },
  });
  revalidatePath(`/posts/${comment.post.slug}`);
  revalidatePath("/admin/comments");
  return comment;
}

export async function deleteComment(id: string) {
  await checkAdmin();
  const comment = await prisma.comment.delete({
    where: { id },
    include: { post: true },
  });
  revalidatePath(`/posts/${comment.post.slug}`);
  revalidatePath("/admin/comments");
  return comment;
}

export async function deleteSubscriber(id: string) {
  await checkAdmin();
  const subscriber = await prisma.newsletterSubscriber.delete({
    where: { id },
  });
  revalidatePath("/admin/subscribers");
  return subscriber;
}
