"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  MessageSquare,
  Users,
  LogOut,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Categories & Tags", href: "/admin/categories", icon: FolderOpen },
  { name: "Comments", href: "/admin/comments", icon: MessageSquare },
  { name: "Subscribers", href: "/admin/subscribers", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-neutral-200 lg:bg-white lg:dark:border-neutral-800 lg:dark:bg-neutral-900">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-100 dark:border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
          <BookOpen className="h-5 w-5 text-neutral-900 dark:text-white" />
          <span>Blog Manager</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white",
                          "group flex gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 transition-colors"
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>

            <li className="mt-auto">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 text-neutral-600 hover:bg-red-50 hover:text-red-650 dark:text-neutral-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
