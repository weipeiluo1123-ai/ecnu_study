import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { userPosts, users, likes, bookmarks, comments, views } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { clearPostsCache } from "@/lib/posts";

// GET /api/admin/posts — list all user-published articles (admin/super_admin only)
export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const posts = db.select({
    id: userPosts.id,
    title: userPosts.title,
    slug: userPosts.slug,
    description: userPosts.description,
    category: userPosts.category,
    isPublished: userPosts.isPublished,
    likesCount: userPosts.likesCount,
    viewsCount: userPosts.viewsCount,
    bookmarksCount: userPosts.bookmarksCount,
    createdAt: userPosts.createdAt,
    authorId: userPosts.authorId,
    authorName: users.username,
  })
    .from(userPosts)
    .leftJoin(users, eq(userPosts.authorId, users.id))
    .orderBy(desc(userPosts.createdAt))
    .all();

  return NextResponse.json({ posts });
}

// PATCH /api/admin/posts — update a user post (admin/super_admin only)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { postId, isPublished, title, description, category } = await req.json();

  const post = db.select().from(userPosts).where(eq(userPosts.id, postId)).get();
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const updateData: Record<string, any> = {};
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  updateData.updatedAt = new Date().toISOString();

  db.update(userPosts).set(updateData).where(eq(userPosts.id, postId)).run();

  clearPostsCache();

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/posts — delete a user post (admin/super_admin only)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const postId = parseInt(searchParams.get("id") || "");
  if (!postId) {
    return NextResponse.json({ error: "缺少文章 ID" }, { status: 400 });
  }

  const post = db.select().from(userPosts).where(eq(userPosts.id, postId)).get();
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // Clean up related data before deleting the post
  db.delete(likes).where(eq(likes.postSlug, post.slug)).run();
  db.delete(bookmarks).where(eq(bookmarks.postSlug, post.slug)).run();
  db.delete(comments).where(eq(comments.postSlug, post.slug)).run();
  db.delete(views).where(eq(views.postSlug, post.slug)).run();
  db.delete(userPosts).where(eq(userPosts.id, postId)).run();

  clearPostsCache();

  return NextResponse.json({ ok: true });
}
