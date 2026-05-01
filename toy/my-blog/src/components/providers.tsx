"use client";

import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { ToastProvider } from "@/hooks/useToast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="nexus-blog-theme"
    >
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
