import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import { Clock, Eye, Folder, Tag as TagIcon, ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  category?: string;
  tag?: string;
  page?: string;
}

function getReadingTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { search, category, tag, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const postsPerPage = 6;
  const skip = (currentPage - 1) * postsPerPage;

  const where: any = {
    published: true,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (tag) {
    where.tags = { some: { slug: tag } };
  }

  let posts: any[] = [];
  let totalPosts = 0;
  let categories: any[] = [];
  let tags: any[] = [];

  try {
    const [fetchedPosts, fetchedTotalPosts, fetchedCategories, fetchedTags] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: postsPerPage,
        include: {
          category: true,
          tags: true,
        },
      }),
      prisma.post.count({ where }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        where: {
          posts: { some: { published: true } },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    posts = fetchedPosts;
    totalPosts = fetchedTotalPosts;
    categories = fetchedCategories;
    tags = fetchedTags;
  } catch (error) {
    console.error("Failed to load public posts:", error);
  }

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    params.set("page", pageNumber.toString());
    return `/?${params.toString()}`;
  };

  return (
    <AnimatedContainer>
      <div className="space-y-10">
      {/* Intro Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
          Writing & Musings
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl">
          Deep dives into software engineering, web performance, and developer experience.
        </p>
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
        {/* Categories navigation */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize border transition-all ${
              !category && !tag
                ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${c.slug}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize border transition-all ${
                category === c.slug
                  ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950"
                  : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <SearchInput />
        </div>
      </div>

      {/* Active filters display */}
      {(category || tag || search) && (
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 px-4 py-3 rounded-lg text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>Showing results for</span>
            {category && (
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                <Folder className="h-3.5 w-3.5" /> {category}
              </span>
            )}
            {tag && (
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                <TagIcon className="h-3.5 w-3.5" /> #{tag}
              </span>
            )}
            {search && (
              <span className="font-semibold text-neutral-900 dark:text-white">
                &ldquo;{search}&rdquo;
              </span>
            )}
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-neutral-900 hover:underline dark:text-white shrink-0 ml-4"
          >
            Clear Filters
          </Link>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 dark:text-neutral-400">
          <p className="text-lg font-medium">No posts found</p>
          <p className="text-sm mt-1">Try refining your search terms or checking another category.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {posts.map((post) => {
            const readingTime = getReadingTime(post.content);
            return (
              <article
                key={post.id}
                className="group relative flex flex-col items-start justify-between rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:border-neutral-300 dark:border-neutral-900 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all hover:scale-[1.01]"
              >
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-x-4 text-xs">
                    <time dateTime={post.createdAt} className="text-neutral-400 dark:text-neutral-500">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                      <Clock className="h-3 w-3" />
                      {readingTime} min read
                    </span>
                    {post.category && (
                      <span className="relative z-10 rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <div className="group relative">
                    <h3 className="text-xl font-bold leading-6 text-neutral-900 group-hover:text-neutral-600 dark:text-white dark:group-hover:text-neutral-300">
                      <Link href={`/posts/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                      {post.summary}
                    </p>
                  </div>
                </div>

                <div className="w-full mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((t: any) => (
                      <Link
                        key={t.id}
                        href={`/?tag=${t.slug}`}
                        className="relative z-10 text-xs text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white"
                      >
                        #{t.name}
                      </Link>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center gap-1 group-hover:underline">
                    Read article <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <div className="flex flex-1 justify-between sm:hidden">
            <Link
              href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
              className={`inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
                currentPage === 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Previous
            </Link>
            <Link
              href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
              className={`inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 ${
                currentPage === totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Next
            </Link>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Showing page <span className="font-semibold text-neutral-900 dark:text-white">{currentPage}</span> of{" "}
                <span className="font-semibold text-neutral-900 dark:text-white">{totalPages}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={currentPage > 1 ? getPageUrl(currentPage - 1) : "#"}
                className={`inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors ${
                  currentPage === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Link>
              <Link
                href={currentPage < totalPages ? getPageUrl(currentPage + 1) : "#"}
                className={`inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors ${
                  currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </AnimatedContainer>
  );
}
