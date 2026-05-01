import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/index";
import { userPosts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { normalizeTags } from "@/lib/constants";
import { clearPostsCache } from "@/lib/posts";

interface Props {
  params: Promise<{ id: string }>;
}

// GET /api/user-posts/[id] — get a single user post for editing
export async function GET(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const postId = parseInt(id);
  if (!postId) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const post = db.select().from(userPosts).where(eq(userPosts.id, postId)).get();
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // Only author, admin, or super_admin can access
  const isAuthor = post.authorId === session.id;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  return NextResponse.json({ post });
}

// PATCH /api/user-posts/[id] — update a user post
export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const postId = parseInt(id);
  if (!postId) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const post = db.select().from(userPosts).where(eq(userPosts.id, postId)).get();
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // Only author, admin, or super_admin can edit
  const isAuthor = post.authorId === session.id;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "无权修改" }, { status: 403 });
  }

  const { title, content, description, category, tags, isPublished, format } = await req.json();
  const now = new Date().toISOString();

  const updateData: Record<string, any> = { updatedAt: now };
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (tags !== undefined) updateData.tags = JSON.stringify(normalizeTags(tags));
  if (isPublished !== undefined) updateData.isPublished = isPublished;
  if (format !== undefined) updateData.format = format === "txt" ? "txt" : "markdown";

  db.update(userPosts).set(updateData).where(eq(userPosts.id, postId)).run();

  clearPostsCache();
  revalidatePath("/posts/" + post.slug);

  return NextResponse.json({ ok: true, post: { id: postId, ...updateData } });
}

// DELETE /api/user-posts/[id] — delete a user post
export async function DELETE(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const postId = parseInt(id);
  if (!postId) {
    return NextResponse.json({ error: "无效 ID" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const post = db.select().from(userPosts).where(eq(userPosts.id, postId)).get();
  if (!post) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // Only author, admin, or super_admin can delete
  const isAuthor = post.authorId === session.id;
  const isAdmin = session.role === "admin" || session.role === "super_admin";
  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "无权删除" }, { status: 403 });
  }

  db.delete(userPosts).where(eq(userPosts.id, postId)).run();

  clearPostsCache();
  revalidatePath("/posts/" + post.slug);

  return NextResponse.json({ ok: true });
}
