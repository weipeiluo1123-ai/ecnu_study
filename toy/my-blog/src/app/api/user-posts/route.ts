import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { userPosts, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { getSession, canUser } from "@/lib/auth";

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
    query = query.where(eq(userPosts.authorId, parseInt(authorId))) as any;
  }

  const results = query.all();
  return NextResponse.json({ posts: results });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canUser(session, "canPost")) {
    return NextResponse.json({ error: "无权发布文章" }, { status: 403 });
  }

  const { title, content, description, category, tags } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }

  const slug = `user-${Date.now()}-${title.slice(0, 30).replace(/[^a-zA-Z0-9一-龥]/g, "-").toLowerCase()}`;
  const now = new Date().toISOString();

  const result = db.insert(userPosts).values({
    title: title.trim(),
    content,
    description: description || title.slice(0, 100),
    slug,
    category: category || "notes",
    tags: JSON.stringify(tags || []),
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
