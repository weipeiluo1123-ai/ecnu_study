import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/ui/BackToTop";
import { BLOG_TITLE, BLOG_DESCRIPTION } from "@/lib/constants";

const BLOG_SUBTITLE = "思考 · 代码 · 生活";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BLOG_TITLE} — ${BLOG_SUBTITLE}`,
    template: `%s — ${BLOG_TITLE}`,
  },
  description: BLOG_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground scan-line">
        <Providers>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTop />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
