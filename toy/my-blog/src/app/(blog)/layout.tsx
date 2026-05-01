import { BLOG_TITLE, BLOG_DESCRIPTION } from "@/lib/constants";
import BlogLayoutClient from "./BlogLayoutClient";

export const metadata = {
  title: {
    default: `${BLOG_TITLE} — 思考 · 代码 · 生活`,
    template: `%s — ${BLOG_TITLE}`,
  },
  description: BLOG_DESCRIPTION,
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogLayoutClient>{children}</BlogLayoutClient>;
}
