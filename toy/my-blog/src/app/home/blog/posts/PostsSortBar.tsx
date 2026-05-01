"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const options = [
  { key: "newest", label: "最新" },
  { key: "oldest", label: "最早" },
  { key: "popular", label: "最热" },
  { key: "most_viewed", label: "最高分" },
] as const;

export function PostsSortBar({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "newest") params.delete("sort");
    else params.set("sort", key);
    params.delete("page"); // reset to page 1
    router.push(`/home/blog/posts?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-alt border border-border text-xs">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => select(opt.key)}
          className={cn(
            "px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap",
            opt.key === current
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
