import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { comments, users } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getSession, canUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");

  let query = db.select({
    id: comments.id,
    content: comments.content,
    createdAt: comments.createdAt,
    postSlug: comments.postSlug,
    authorId: comments.authorId,
    authorName: comments.authorName,
    author: {
      id: users.id,
      username: users.username,
      avatar: users.avatar,
    },
  })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .orderBy(desc(comments.createdAt));

  // If postSlug is provided and is not a special keyword, filter by it
  if (postSlug && postSlug !== "__all__") {
    query = query.where(eq(comments.postSlug, postSlug)) as typeof query;
  }

  const rows = query.all();

  // Map to client-friendly format
  const mapped = rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt,
    postSlug: r.postSlug,
    author: r.author?.id
      ? { id: r.author.id, username: r.author.username, avatar: r.author.avatar }
      : { id: null, username: r.authorName || "已注销", avatar: null },
  }));

  return NextResponse.json({ comments: mapped });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !canUser(session, "canComment")) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { postSlug, content } = await req.json();
  if (!postSlug || !content?.trim()) {
    return NextResponse.json({ error: "内容和文章不能为空" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const result = db.insert(comments).values({
    postSlug,
    authorId: session.id,
    authorName: session.username,
    content: content.trim(),
    createdAt: now,
  }).run();

  return NextResponse.json({
    comment: {
      id: Number(result.lastInsertRowid),
      content: content.trim(),
      createdAt: now,
      postSlug,
      author: { id: session.id, username: session.username },
    },
  });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const commentId = parseInt(searchParams.get("id") || "");

  const comment = db.select().from(comments).where(eq(comments.id, commentId)).get();
  if (!comment) {
    return NextResponse.json({ error: "评论不存在" }, { status: 404 });
  }

  if (comment.authorId !== session.id && session.role !== "admin") {
    return NextResponse.json({ error: "无权删除此评论" }, { status: 403 });
  }

  db.delete(comments).where(eq(comments.id, commentId)).run();
  return NextResponse.json({ ok: true });
}
