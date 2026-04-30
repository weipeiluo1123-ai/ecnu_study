import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users, nameChangeRequests } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET /api/name-change — list all name change requests (admin/super_admin only)
export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const requests = db.select({
    id: nameChangeRequests.id,
    userId: nameChangeRequests.userId,
    oldName: nameChangeRequests.oldName,
    newName: nameChangeRequests.newName,
    status: nameChangeRequests.status,
    reviewedBy: nameChangeRequests.reviewedBy,
    reviewedAt: nameChangeRequests.reviewedAt,
    createdAt: nameChangeRequests.createdAt,
  })
    .from(nameChangeRequests)
    .orderBy(desc(nameChangeRequests.createdAt))
    .all();

  return NextResponse.json({ requests });
}

// POST /api/name-change — submit a name change request
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { newName } = await req.json();

  if (!newName || newName.length < 2 || newName.length > 20) {
    return NextResponse.json({ error: "用户名长度需在 2-20 个字符之间" }, { status: 400 });
  }

  // Check for reserved usernames
  const reservedUsernames = ["weipeiluo", "admin", "root", "system"];
  if (reservedUsernames.includes(newName.toLowerCase())) {
    return NextResponse.json({ error: "该用户名已被保留" }, { status: 409 });
  }

  // Check if username is already taken
  const existing = db.select().from(users).where(eq(users.username, newName)).get();
  if (existing && existing.id !== session.id) {
    return NextResponse.json({ error: "该用户名已被使用" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const oldName = session.username;

  // Update username immediately
  db.update(users).set({ username: newName, updatedAt: now }).where(eq(users.id, session.id)).run();

  // Create a pending review record
  db.insert(nameChangeRequests).values({
    userId: session.id,
    oldName,
    newName,
    status: "pending",
    createdAt: now,
  }).run();

  return NextResponse.json({ ok: true, message: "改名成功，等待管理员审核" });
}

// PATCH /api/name-change — review a name change request (admin/super_admin only)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { requestId, action } = await req.json();

  const request = db.select().from(nameChangeRequests).where(eq(nameChangeRequests.id, requestId)).get();
  if (!request) {
    return NextResponse.json({ error: "请求不存在" }, { status: 404 });
  }

  if (request.status !== "pending") {
    return NextResponse.json({ error: "该请求已处理" }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (action === "approve") {
    // Approve: keep the new name, mark request as approved
    db.update(nameChangeRequests).set({
      status: "approved",
      reviewedBy: session.id,
      reviewedAt: now,
    }).where(eq(nameChangeRequests.id, requestId)).run();

    return NextResponse.json({ ok: true, message: "已批准改名请求" });
  } else if (action === "reject") {
    // Reject: rollback username to old name
    db.update(users).set({ username: request.oldName, updatedAt: now }).where(eq(users.id, request.userId)).run();

    db.update(nameChangeRequests).set({
      status: "rejected",
      reviewedBy: session.id,
      reviewedAt: now,
    }).where(eq(nameChangeRequests.id, requestId)).run();

    return NextResponse.json({ ok: true, message: "已驳回改名请求，用户名已回滚" });
  }

  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}
