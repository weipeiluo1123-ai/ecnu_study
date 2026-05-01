import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { db } from "@/lib/db/index";
import { userPosts, users, likes, bookmarks } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

// In-memory cache: MDX posts never change at runtime, cache indefinitely
let mdxCache: PostMeta[] | null = null;

// getAllPosts() result cache with 6s TTL — avoids redoing heavy work
// on every dynamic render (searchParams forces /posts to be dynamic)
let allPostsCache: { data: PostMeta[]; time: number } | null = null;
const ALL_POSTS_TTL = 60000;

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
  likesCount?: number;
  bookmarksCount?: number;
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
    const user = db.select({
      id: users.id,
      username: users.username,
      role: users.role,
    }).from(users).where(eq(users.username, username)).get();
    if (user) return { id: user.id, username: user.username, role: user.role };
  } catch (e) {
    console.error("getAuthorInfo failed for", username, e);
  }
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
  } catch (e) {
    console.error("getPostBySlug failed for", slug, e);
    return null;
  }
}

function getAllMdxPosts(): PostMeta[] {
  if (mdxCache) return mdxCache;
  const slugs = getPostSlugs();
  mdxCache = slugs
    .map((slug) => getPostBySlug(slug.replace(/\.(md|mdx)$/, "")))
    .filter((post): post is PostData => post !== null && post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _, ...meta }) => meta);
  return mdxCache;
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
      likesCount: userPosts.likesCount,
      bookmarksCount: userPosts.bookmarksCount,
    })
    .from(userPosts)
    .leftJoin(users, eq(userPosts.authorId, users.id))
    .where(eq(userPosts.isPublished, true))
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
      likesCount: r.likesCount ?? 0,
      bookmarksCount: r.bookmarksCount ?? 0,
    }));
  } catch (e) {
    console.error("getAllDbPosts failed", e);
    return [];
  }
}

export function getAllPosts(): PostMeta[] {
  // Use cached result if within TTL
  const now = Date.now();
  if (allPostsCache && now - allPostsCache.time < ALL_POSTS_TTL) {
    return allPostsCache.data;
  }

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

  // Batch query likes and bookmarks counts for MDX posts
  try {
    const likeRows = db.select({
      slug: likes.postSlug,
      count: sql<number>`count(*)`,
    }).from(likes).groupBy(likes.postSlug).all() as { slug: string; count: number }[];

    const bmRows = db.select({
      slug: bookmarks.postSlug,
      count: sql<number>`count(*)`,
    }).from(bookmarks).groupBy(bookmarks.postSlug).all() as { slug: string; count: number }[];

    const likeMap = new Map(likeRows.map(r => [r.slug, r.count]));
    const bmMap = new Map(bmRows.map(r => [r.slug, r.count]));

    for (const post of merged) {
      if (post.likesCount === undefined) {
        post.likesCount = likeMap.get(post.slug) ?? 0;
      }
      if (post.bookmarksCount === undefined) {
        post.bookmarksCount = bmMap.get(post.slug) ?? 0;
      }
    }
  } catch (e) {
    console.error("batch like/bookmark count failed", e);
  }

  const result = merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  allPostsCache = { data: result, time: Date.now() };
  return result;
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

/** Call after creating/editing/deleting a user post to invalidate cache */
export function clearPostsCache() {
  allPostsCache = null;
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
