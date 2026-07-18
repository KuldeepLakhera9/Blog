"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const commentSchema = z.object({
  postId: z.string().min(1),
  authorName: z.string().min(1, "Name is required").max(100),
  authorEmail: z.string().email("Invalid email address"),
  content: z.string().min(10, "Comment must be at least 10 characters").max(1000),
});

export async function submitComment(data: z.infer<typeof commentSchema>) {
  const parsed = commentSchema.parse(data);

  const comment = await prisma.comment.create({
    data: {
      postId: parsed.postId,
      authorName: parsed.authorName,
      authorEmail: parsed.authorEmail,
      content: parsed.content,
      approved: false, // Default is pending moderation
    },
    include: {
      post: true,
    },
  });

  // Revalidate the post page to clear/update comment lists if needed
  revalidatePath(`/posts/${comment.post.slug}`);
  return { success: true, message: "Comment submitted for moderation!" };
}

const subscriberSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function subscribeNewsletter(email: string) {
  const parsed = subscriberSchema.parse({ email });

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: parsed.email },
    });

    if (existing) {
      return { success: true, message: "You are already subscribed!" };
    }

    await prisma.newsletterSubscriber.create({
      data: { email: parsed.email },
    });

    return { success: true, message: "Subscribed successfully!" };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return { success: false, message: "Subscription failed. Please try again." };
  }
}
