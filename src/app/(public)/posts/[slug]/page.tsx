import React from "react";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import Link from "next/link";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { Clock, Eye, Folder, Tag, Calendar, ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function getReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let post = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug },
    });
  } catch (e) {
    console.error("Error generating metadata:", e);
  }

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | DevNotes`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      url: `/posts/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post: any = null;
  try {
    post = await prisma.post.findUnique({
      where: { slug, published: true },
      include: {
        category: true,
        tags: true,
        comments: {
          where: { approved: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
  }

  if (!post) {
    notFound();
  }

  // Increment view count at render-time
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
  } catch (err) {
    console.error("Failed to increment views:", err);
  }

  const readingTime = getReadingTime(post.content);

  // JSON-LD structured data schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary,
    "datePublished": post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": "Blog Admin",
    },
  };

  return (
    <AnimatedContainer>
      <div className="space-y-12">
      {/* JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to articles
        </Link>
      </div>

      {/* Post Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-450 dark:text-neutral-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTime} min read
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.views + 1} views
          </span>
          {post.category && (
            <>
              <span>•</span>
              <Link
                href={`/?category=${post.category.slug}`}
                className="relative z-10 rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl leading-tight">
          {post.title}
        </h1>
        
        <p className="text-lg text-neutral-500 dark:text-neutral-400 border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 py-1 italic">
          {post.summary}
        </p>
      </header>

      {/* Post Content */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-neutral-950 dark:prose-a:text-white prose-img:rounded-xl prose-img:shadow-sm"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags Section */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-b border-neutral-150 py-4 dark:border-neutral-800">
          <span className="text-sm text-neutral-450 dark:text-neutral-500 font-semibold self-center mr-2">Tags:</span>
          {post.tags.map((tag: any) => (
            <Link
              key={tag.id}
              href={`/?tag=${tag.slug}`}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-650 hover:bg-neutral-50 dark:border-neutral-805 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            >
              <Tag className="h-3.5 w-3.5" />
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6 pt-6 border-t border-neutral-200 dark:border-neutral-850">
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
          Comments ({post.comments.length})
        </h3>
        
        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            post.comments.map((comment: any) => (
              <div
                key={comment.id}
                className="rounded-xl border border-neutral-150 bg-neutral-50/50 p-5 dark:border-neutral-850 dark:bg-neutral-900/50 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-905 dark:text-white text-sm">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Form */}
      <CommentForm postId={post.id} />
      </div>
    </AnimatedContainer>
  );
}
