"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-border bg-surface hover:border-accent transition-colors cursor-pointer"
      aria-label="切换主题"
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-neon-cyan" />
      ) : (
        <Moon size={16} className="text-accent" />
      )}
    </motion.button>
  );
}
