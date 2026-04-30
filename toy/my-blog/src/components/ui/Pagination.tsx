"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  function getPageLink(page: number) {
    if (page === 1) return basePath;
    return `${basePath}?page=${page}`;
  }

  function getVisiblePages(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-12">
      {/* Prev */}
      <Link
        href={getPageLink(currentPage - 1)}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors",
          currentPage <= 1 && "pointer-events-none opacity-40"
        )}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft size={16} />
      </Link>

      {/* Pages */}
      {getVisiblePages().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-muted">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={getPageLink(page)}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border transition-colors",
              page === currentPage
                ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                : "border-border text-muted hover:text-foreground hover:border-accent"
            )}
          >
            {page}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={getPageLink(currentPage + 1)}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors",
          currentPage >= totalPages && "pointer-events-none opacity-40"
        )}
        aria-disabled={currentPage >= totalPages}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
