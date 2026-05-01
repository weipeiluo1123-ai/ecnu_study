import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { userPosts, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { getSession, canUser } from "@/lib/auth";
import { normalizeTags } from "@/lib/constants";
import { getAllPosts } from "@/lib/posts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId");

  let query = db.select({
    id: userPosts.id,
    title: userPosts.title,
    description: userPosts.description,
    slug: userPosts.slug,
    category: userPosts.category,
    tags: userPosts.tags,
    format: userPosts.format,
    likesCount: userPosts.likesCount,
    viewsCount: userPosts.viewsCount,
    bookmarksCount: userPosts.bookmarksCount,
    isPublished: userPosts.isPublished,
    createdAt: userPosts.createdAt,
    author: {
      id: users.id,
      username: users.username,
    },
  })
    .from(userPosts)
    .leftJoin(users, eq(userPosts.authorId, users.id))
    .orderBy(desc(userPosts.createdAt));

  if (authorId) {
    const uid = parseInt(authorId);
    query = query.where(eq(userPosts.authorId, uid)) as any;

    // Also include MDX posts for admin/super_admin users
    const author = db.select().from(users).where(eq(users.id, uid)).get();
    if (author && (author.role === "admin" || author.role === "super_admin")) {
      const allPosts = getAllPosts();
      const mdxPosts = allPosts
        .filter(p => p.authorId === uid)
        .map(p => ({
          id: 0,
          title: p.title,
          description: p.description,
          slug: p.slug,
          category: p.category,
          tags: JSON.stringify(p.tags),
          format: "markdown",
          likesCount: p.likesCount ?? 0,
          viewsCount: 0,
          bookmarksCount: p.bookmarksCount ?? 0,
          isPublished: true,
          author: { id: uid, username: p.author },
          createdAt: p.date,
        }));

      const dbResults = query.all();
      // Merge MDX posts with DB posts, deduplicate by slug
      const seen = new Set(dbResults.map(r => r.slug));
      const merged = [...dbResults];
      for (const mdx of mdxPosts) {
        if (!seen.has(mdx.slug)) {
          seen.add(mdx.slug);
          merged.push(mdx);
        }
      }
      return NextResponse.json({ posts: merged });
    }
  }

  const results = query.all();
  return NextResponse.json({ posts: results });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canUser(session, "canPost")) {
    return NextResponse.json({ error: "无权发布文章" }, { status: 403 });
  }

  const { title, content, description, category, tags, format } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }

  const slug = `user-${Date.now()}-${title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase()}`;
  const now = new Date().toISOString();

  const result = db.insert(userPosts).values({
    title: title.trim(),
    content,
    description: description || title.slice(0, 100),
    slug,
    category: category || "notes",
    tags: JSON.stringify(normalizeTags(tags || [])),
    format: format === "txt" ? "txt" : "markdown",
    authorId: session.id,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }).run();

  return NextResponse.json({
    post: {
      id: Number(result.lastInsertRowid),
      slug,
      title: title.trim(),
    },
  });
}
