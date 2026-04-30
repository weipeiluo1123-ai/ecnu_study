import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { likes, userPosts } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  const userId = searchParams.get("userId");

  if (!postSlug) {
    return NextResponse.json({ error: "缺少 postSlug" }, { status: 400 });
  }

  const likeCount = db.select({ count: count() }).from(likes)
    .where(eq(likes.postSlug, postSlug))
    .get();

  let liked = false;
  if (userId) {
    const existing = db.select().from(likes)
      .where(
        and(eq(likes.postSlug, postSlug), eq(likes.userId, parseInt(userId)))
      )
      .get();
    liked = !!existing;
  }

  return NextResponse.json({ count: likeCount?.count || 0, liked });
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

  const existing = db.select().from(likes)
    .where(
      and(eq(likes.postSlug, postSlug), eq(likes.userId, session.id))
    )
    .get();

  if (existing) {
    // Unlike
    db.delete(likes)
      .where(
        and(eq(likes.postSlug, postSlug), eq(likes.userId, session.id))
      )
      .run();
  } else {
    // Like
    db.insert(likes).values({
      postSlug,
      userId: session.id,
      createdAt: new Date().toISOString(),
    }).run();
  }

  const likeCount = db.select({ count: count() }).from(likes)
    .where(eq(likes.postSlug, postSlug))
    .get();

  // Sync user_posts aggregate count
  db.update(userPosts)
    .set({ likesCount: likeCount?.count || 0 })
    .where(eq(userPosts.slug, postSlug))
    .run();

  return NextResponse.json({
    liked: !existing,
    count: likeCount?.count || 0,
  });
}
