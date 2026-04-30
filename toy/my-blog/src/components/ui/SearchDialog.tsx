"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    },
    [query, router, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="relative flex items-center rounded-xl border border-neon-cyan/30 bg-surface shadow-2xl shadow-neon-cyan/5">
                <Search size={18} className="absolute left-4 text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索文章、标签、分类..."
                  className="flex-1 bg-transparent pl-12 pr-12 py-4 text-foreground text-base outline-none placeholder:text-muted"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-12 text-muted hover:text-foreground cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 p-1 text-muted hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </form>
            <p className="mt-2 text-xs text-muted text-center">
              按 Enter 搜索，按 ESC 关闭
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
