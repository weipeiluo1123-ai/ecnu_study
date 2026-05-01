"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";

export default function BlogLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-full">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}`,
          }}
        />
      </div>
    </AuthProvider>
  );
}
