"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSubscriber } from "@/app/admin/actions";
import { formatDate } from "@/lib/utils";
import { Trash2, Users, Loader2 } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  createdAt: Date | string;
}

export function SubscriberManager({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [isPending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    setActionId(id);
    startTransition(async () => {
      try {
        await deleteSubscriber(id);
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } catch (err) {
        alert("Failed to delete subscriber");
      } finally {
        setActionId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            View and manage your blog newsletter subscriptions.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {subscribers.length} total
        </span>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/50 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-950/50 dark:text-neutral-400">
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Subscribed Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    No subscribers yet.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                      {formatDate(sub.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={isPending}
                        className="p-1.5 text-neutral-400 hover:text-red-650 dark:hover:text-red-400 transition-colors"
                        title="Remove Subscriber"
                      >
                        {isPending && actionId === sub.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
