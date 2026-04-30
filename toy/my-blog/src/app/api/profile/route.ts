import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users, userPosts, likes, bookmarks, views } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

function getDateRange(range: "weekly" | "monthly"): Date {
  const now = new Date();
  switch (range) {
    case "weekly":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function computeScoreForPosts(posts: any[], since?: string): number {
  let score = 0;
  for (const post of posts) {
    const sinceFilter = since ? sql` AND ${likes.createdAt} >= ${since}` : sql``;
    const sinceFilterBm = since ? sql` AND ${bookmarks.createdAt} >= ${since}` : sql``;
    const sinceFilterV = since ? sql` AND ${views.createdAt} >= ${since}` : sql``;

    const likeRow = db.get<{ count: number }>(
      sql`SELECT COUNT(*) as count FROM likes WHERE post_slug = ${post.slug}${sinceFilter}`
    );
    const bmRow = db.get<{ count: number }>(
      sql`SELECT COUNT(*) as count FROM bookmarks WHERE post_slug = ${post.slug}${sinceFilterBm}`
    );
    const viewRow = db.get<{ count: number }>(
      sql`SELECT COUNT(*) as count FROM views WHERE post_slug = ${post.slug}${sinceFilterV}`
    );

    const likeCount = likeRow?.count || 0;
    const bmCount = bmRow?.count || 0;
    const viewCount = viewRow?.count || 0;
    score += likeCount * 2 + bmCount * 3 + viewCount * 1;
  }
  return score;
}

// GET /api/profile — get current user's full profile with stats
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const user = db.select().from(users).where(eq(users.id, session.id)).get();
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // Compute scores
  const userPostsList = db.select().from(userPosts).where(eq(userPosts.authorId, session.id)).all();
  const now = new Date().toISOString();
  const weeklySince = getDateRange("weekly").toISOString();
  const monthlySince = getDateRange("monthly").toISOString();

  const totalScore = computeScoreForPosts(userPostsList);
  const weeklyScore = computeScoreForPosts(userPostsList, weeklySince);
  const monthlyScore = computeScoreForPosts(userPostsList, monthlySince);
  const postCount = userPostsList.length;

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
    stats: {
      totalScore,
      weeklyScore,
      monthlyScore,
      postCount,
    },
  });
}

// PATCH /api/profile — update current user's profile (bio only)
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { bio } = await req.json();
  const now = new Date().toISOString();

  db.update(users)
    .set({ bio: bio || null, updatedAt: now })
    .where(eq(users.id, session.id))
    .run();

  return NextResponse.json({ ok: true });
}
