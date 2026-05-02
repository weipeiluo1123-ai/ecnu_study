import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users, comments, likes, bookmarks } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { getSession, parsePermissions } from "@/lib/auth";

// GET /api/users — list all users (public, basic fields only)
export async function GET() {
  const rows = db.select({
    id: users.id,
    username: users.username,
    role: users.role,
    bio: users.bio,
    createdAt: users.createdAt,
  }).from(users).all();

  return NextResponse.json({ users: rows });
}

// PATCH /api/users — update user (admin only)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { userId, username, role, permissions, bio } = await req.json();

  if (!userId || typeof userId !== "number") {
    return NextResponse.json({ error: "缺少有效的 userId" }, { status: 400 });
  }

  // Protect super_admin from modification by regular admin
  const targetUser = db.select().from(users).where(eq(users.id, userId)).get();
  if (targetUser?.role === "super_admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "不能修改超级管理员" }, { status: 403 });
  }

  // Only super_admin can change roles
  if (role && session.role !== "super_admin") {
    return NextResponse.json({ error: "无权修改用户角色" }, { status: 403 });
  }

  const updateData: Record<string, any> = {};
  if (role) updateData.role = role;
  if (permissions) updateData.permissions = JSON.stringify(permissions);
  if (bio !== undefined) updateData.bio = bio;
  if (username) updateData.username = username;
  updateData.updatedAt = new Date().toISOString();

  db.update(users).set(updateData).where(eq(users.id, userId)).run();

  return NextResponse.json({ ok: true });
}

// DELETE /api/users — delete user (admin only)
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get("id") || "");

  if (isNaN(userId) || userId < 1) {
    return NextResponse.json({ error: "缺少有效的用户 ID" }, { status: 400 });
  }
  if (userId === session.id) {
    return NextResponse.json({ error: "不能删除自己" }, { status: 400 });
  }

  // Protect super_admin from deletion
  const targetUser = db.select().from(users).where(eq(users.id, userId)).get();
  if (targetUser?.role === "super_admin") {
    return NextResponse.json({ error: "不能删除超级管理员" }, { status: 403 });
  }

  // Clean up user data: anonymize comments, remove likes/bookmarks/views
  const name = targetUser?.username || "已注销";
  db.update(comments)
    .set({ authorId: null, authorName: `已注销(${name})` })
    .where(eq(comments.authorId, userId))
    .run();
  db.delete(likes).where(eq(likes.userId, userId)).run();
  db.delete(bookmarks).where(eq(bookmarks.userId, userId)).run();
  db.delete(users).where(eq(users.id, userId)).run();

  return NextResponse.json({ ok: true });
}
