import Link from "next/link";
import { TAGS } from "@/lib/constants";

interface Props {
  tag: string;
  count?: number;
  size?: "sm" | "md" | "lg";
}

export function TagBadge({ tag, count, size = "sm" }: Props) {
  const tagInfo = TAGS.find((t) => t.slug === tag);
  const displayName = tagInfo?.name || tag;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Link
      href={`/tags/${tag}`}
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-surface-alt ${sizeClasses[size]} text-muted hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-300`}
    >
      <span>#</span>
      {displayName}
      {count !== undefined && (
        <span className="text-xs opacity-60">({count})</span>
      )}
    </Link>
  );
}
