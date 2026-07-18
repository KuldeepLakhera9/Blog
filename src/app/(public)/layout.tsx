import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BookOpen, Rss } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-background/80 backdrop-blur-md dark:border-neutral-800 transition-colors">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <BookOpen className="h-5 w-5 text-neutral-900 dark:text-white" />
              <span>DevNotes</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Blog
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 transition-colors"
            >
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-background dark:border-neutral-800 transition-colors">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          <NewsletterSignup />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100 pt-8 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">
              &copy; {new Date().getFullYear()} DevNotes. Built with Next.js, Prisma & Tailwind.
            </p>
            <div className="flex items-center gap-4 text-neutral-500">
              <Link
                href="/feed.xml"
                target="_blank"
                className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <Rss className="h-3.5 w-3.5" />
                RSS Feed
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
