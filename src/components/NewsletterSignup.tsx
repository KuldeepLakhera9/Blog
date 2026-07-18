"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { subscribeNewsletter } from "@/app/actions";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof schema>;

export function NewsletterSignup() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setMessage(null);
    startTransition(async () => {
      const res = await subscribeNewsletter(values.email);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        reset();
      } else {
        setMessage({ type: "error", text: res.message });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-850 dark:bg-neutral-900/50 space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
          Subscribe to my newsletter
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Get notified when I publish new guides, tutorials, and case studies.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            disabled={isPending}
            className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-colors shrink-0"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
          </button>
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>
        )}
      </form>

      {message && (
        <p
          className={`text-xs pl-1 font-medium ${
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
