"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValue = searchParams.get("search") || "";
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedValue) {
      params.set("search", debouncedValue);
    } else {
      params.delete("search");
    }
    params.delete("page"); // reset page on search
    router.push(`/?${params.toString()}`);
  }, [debouncedValue, router, searchParams]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        placeholder="Search articles..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-10 pr-8 text-sm text-neutral-900 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 dark:border-neutral-805 dark:bg-neutral-900 dark:text-neutral-50 dark:focus:border-neutral-50 dark:focus:ring-neutral-50"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function SearchInput() {
  return (
    <Suspense fallback={
      <div className="relative h-9 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
    }>
      <SearchBar />
    </Suspense>
  );
}
