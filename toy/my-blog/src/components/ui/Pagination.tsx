"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [5, 10, 20] as const;

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
  pageSize?: number;
  showSizeSelector?: boolean;
}

export function Pagination({ currentPage, totalPages, basePath, pageSize = 10, showSizeSelector = false }: Props) {
  if (totalPages <= 1 && !showSizeSelector) return null;

  function getPageLink(page: number, size?: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (size !== undefined && size !== 10) params.set("pageSize", String(size));
    const qs = params.toString();
    if (!qs) return basePath;
    return `${basePath}?${qs}`;
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
    <div className="flex flex-col items-center gap-4 mt-12">
      {showSizeSelector && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>每页显示：</span>
          {PAGE_SIZES.map((size) => (
            <Link
              key={size}
              href={getPageLink(1, size === 10 ? undefined : size)}
              className={cn(
                "px-3 py-1 rounded-md border transition-colors",
                size === pageSize
                  ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                  : "border-border text-muted hover:text-foreground hover:border-accent"
              )}
            >
              {size}
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1">
          <Link
            href={getPageLink(currentPage - 1, pageSize)}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors",
              currentPage <= 1 && "pointer-events-none opacity-40"
            )}
            aria-disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
          </Link>

          {getVisiblePages().map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-muted">...</span>
            ) : (
              <Link
                key={page}
                href={getPageLink(page, pageSize)}
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

          <Link
            href={getPageLink(currentPage + 1, pageSize)}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors",
              currentPage >= totalPages && "pointer-events-none opacity-40"
            )}
            aria-disabled={currentPage >= totalPages}
          >
            <ChevronRight size={16} />
          </Link>
        </nav>
      )}
    </div>
  );
}
