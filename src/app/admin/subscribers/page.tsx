import React from "react";
import { prisma } from "@/lib/db";
import { SubscriberManager } from "@/components/admin/SubscriberManager";

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage() {
  let subscribers: any[] = [];

  try {
    subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch subscribers for admin page:", error);
  }

  return (
    <div className="space-y-8">
      <SubscriberManager initialSubscribers={subscribers} />
    </div>
  );
}
