"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { BackToHome } from "@/components/ui/BackToHome";

export default function BlogLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }, []);

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex flex-col min-h-full">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <BackToHome />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}
