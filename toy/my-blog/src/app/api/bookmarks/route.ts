import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { bookmarks, userPosts } from "@/lib/db/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  const userId = searchParams.get("userId");

  // If no postSlug, return all bookmarks for a user
  if (!postSlug && userId) {
    const rows = db.select({
      id: bookmarks.id,
      postSlug: bookmarks.postSlug,
      createdAt: bookmarks.createdAt,
    })
      .from(bookmarks)
      .where(eq(bookmarks.userId, parseInt(userId)))
      .orderBy(desc(bookmarks.createdAt))
      .all();
    return NextResponse.json({ bookmarks: rows });
  }

  if (!postSlug) {
    return NextResponse.json({ error: "缺少 postSlug" }, { status: 400 });
  }

  const total = db.select({ count: count() }).from(bookmarks)
    .where(eq(bookmarks.postSlug, postSlug))
    .get();

  let bookmarked = false;
  if (userId) {
    const existing = db.select().from(bookmarks)
      .where(
        and(eq(bookmarks.postSlug, postSlug), eq(bookmarks.userId, parseInt(userId)))
      )
      .get();
    bookmarked = !!existing;
  }

  return NextResponse.json({ count: total?.count || 0, bookmarked });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { postSlug } = await req.json();
  if (!postSlug) {
    return NextResponse.json({ error: "缺少 postSlug" }, { status: 400 });
  }

  const existing = db.select().from(bookmarks)
    .where(
      and(eq(bookmarks.postSlug, postSlug), eq(bookmarks.userId, session.id))
    )
    .get();

  if (existing) {
    db.delete(bookmarks)
      .where(
        and(eq(bookmarks.postSlug, postSlug), eq(bookmarks.userId, session.id))
      )
      .run();
  } else {
    db.insert(bookmarks).values({
      postSlug,
      userId: session.id,
      createdAt: new Date().toISOString(),
    }).run();
  }

  const total = db.select({ count: count() }).from(bookmarks)
    .where(eq(bookmarks.postSlug, postSlug))
    .get();

  // Sync user_posts aggregate count
  db.update(userPosts)
    .set({ bookmarksCount: total?.count || 0 })
    .where(eq(userPosts.slug, postSlug))
    .run();

  return NextResponse.json({
    bookmarked: !existing,
    count: total?.count || 0,
  });
}
