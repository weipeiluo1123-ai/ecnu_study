import { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索博客文章",
};

export const revalidate = 60;

export default function SearchPage() {
  const posts = getAllPosts();
  return <SearchPageClient initialPosts={posts} />;
}
