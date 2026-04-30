import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "@/lib/db/index";
import { userPosts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  authorId: number | null;
  authorRole: string | null;
  coverImage?: string;
  published: boolean;
  featured?: boolean;
}

export interface PostData extends PostMeta {
  content: string;
}

export interface AuthorInfo {
  id: number | null;
  username: string;
  role: string | null;
}

export function getAuthorInfo(username: string): AuthorInfo {
  try {
    const Database = require("better-sqlite3");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "data", "blog.db");
    if (require("fs").existsSync(dbPath)) {
      const sqlite = new Database(dbPath);
      const row = sqlite.prepare("SELECT id, username, role FROM users WHERE username = ?").get(username);
      sqlite.close();
      if (row) return { id: row.id, username: row.username, role: row.role || null };
    }
  } catch {}
  return { id: null, username, role: null };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
}

export function getPostBySlug(slug: string): PostData | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const authorName = data.author || "admin";
    const authorInfo = getAuthorInfo(authorName);

    return {
      slug,
      title: data.title || slug,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      updated: data.updated ? new Date(data.updated).toISOString() : undefined,
      description: data.description || "",
      category: data.category || "notes",
      tags: data.tags || [],
      author: authorName,
      authorId: authorInfo.id,
      authorRole: authorInfo.role,
      coverImage: data.coverImage || undefined,
      published: data.published !== false,
      featured: data.featured || false,
      content,
    };
  } catch {
    return null;
  }
}

function getAllMdxPosts(): PostMeta[] {
  const slugs = getPostSlugs();
  return slugs
    .map((slug) => getPostBySlug(slug.replace(/\.(md|mdx)$/, "")))
    .filter((post): post is PostData => post !== null && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _, ...meta }) => meta);
}

function getAllDbPosts(): PostMeta[] {
  try {
    const rows = db.select({
      slug: userPosts.slug,
      title: userPosts.title,
      date: userPosts.createdAt,
      updated: userPosts.updatedAt,
      description: userPosts.description,
      category: userPosts.category,
      tags: userPosts.tags,
      authorId: userPosts.authorId,
      authorUsername: users.username,
      authorRole: users.role,
    })
    .from(userPosts)
    .leftJoin(users, eq(userPosts.authorId, users.id))
    .where(eq(userPosts.isPublished, true as any))
    .all();

    return rows.map(r => ({
      slug: r.slug,
      title: r.title,
      date: r.date,
      updated: r.updated || undefined,
      description: r.description || "",
      category: r.category || "notes",
      tags: JSON.parse(r.tags || "[]"),
      author: r.authorUsername || "已注销",
      authorId: r.authorId,
      authorRole: r.authorRole,
      published: true,
    }));
  } catch {
    return [];
  }
}

export function getAllPosts(): PostMeta[] {
  const mdx = getAllMdxPosts();
  const dbp = getAllDbPosts();

  // Merge, deduplicate by slug (DB posts take precedence if same slug)
  const seen = new Set<string>();
  const merged: PostMeta[] = [];
  for (const post of [...mdx, ...dbp]) {
    if (!seen.has(post.slug)) {
      seen.add(post.slug);
      merged.push(post);
    }
  }

  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostsByCategory(category: string): PostMeta[] {
  return getAllPosts().filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
}

export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getAllCategories(): Record<string, number> {
  const counts: Record<string, number> = {};
  getAllPosts().forEach((post) => {
    const cat = post.category;
    counts[cat] = (counts[cat] || 0) + 1;
  });
  return counts;
}

export function getAllTags(): Record<string, number> {
  const counts: Record<string, number> = {};
  getAllPosts().forEach((post) => {
    post.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}

export function getFeaturedPosts(): PostMeta[] {
  return getAllPosts().filter((post) => post.featured);
}

export function getRecentPosts(count: number = 5): PostMeta[] {
  return getAllPosts().slice(0, count);
}

export function paginatePosts(
  posts: PostMeta[],
  page: number = 1,
  perPage: number = 10
): { posts: PostMeta[]; totalPages: number; currentPage: number } {
  const totalPages = Math.ceil(posts.length / perPage);
  const start = (page - 1) * perPage;
  return {
    posts: posts.slice(start, start + perPage),
    totalPages,
    currentPage: page,
  };
}

export function searchPosts(query: string): PostMeta[] {
  const q = query.toLowerCase();
  return getAllPosts().filter(
    (post) =>
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q)
  );
}
