import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { likes, bookmarks, views } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { getAllPosts } from "@/lib/posts";

function getDateRange(range: "daily" | "weekly" | "monthly"): Date {
  const now = new Date();
  switch (range) {
    case "daily":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "weekly") as "daily" | "weekly" | "monthly";
  const since = getDateRange(range).toISOString();

  // Get ALL posts (MDX + user_posts) with author info
  const allPosts = getAllPosts();

  type ScoreEntry = {
    userId: number;
    username: string;
    score: number;
    postCount: number;
    totalLikes: number;
    totalViews: number;
    totalBookmarks: number;
  };

  const scores: Record<number, ScoreEntry> = {};

  for (const post of allPosts) {
    if (!post.authorId) continue;

    if (!scores[post.authorId]) {
      scores[post.authorId] = {
        userId: post.authorId,
        username: post.author,
        score: 0,
        postCount: 0,
        totalLikes: 0,
        totalViews: 0,
        totalBookmarks: 0,
      };
    }

    const s = scores[post.authorId];
    s.postCount++;

    // Likes within time range
    const likesInRange = db.select({ count: count() }).from(likes)
      .where(sql`${likes.postSlug} = ${post.slug} AND ${likes.createdAt} >= ${since}`)
      .get();
    const likeCount = likesInRange?.count || 0;
    s.totalLikes += likeCount;
    s.score += likeCount * 5;

    // Bookmarks within time range
    const bmInRange = db.select({ count: count() }).from(bookmarks)
      .where(sql`${bookmarks.postSlug} = ${post.slug} AND ${bookmarks.createdAt} >= ${since}`)
      .get();
    const bmCount = bmInRange?.count || 0;
    s.totalBookmarks += bmCount;
    s.score += bmCount * 10;

    // Views within time range
    const viewsInRange = db.select({ count: count() }).from(views)
      .where(sql`${views.postSlug} = ${post.slug} AND ${views.createdAt} >= ${since}`)
      .get();
    const viewCount = viewsInRange?.count || 0;
    s.totalViews += viewCount;
    s.score += viewCount * 1;
  }

  const sorted = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map((s, i) => ({ rank: i + 1, ...s }));

  return NextResponse.json({ range, leaderboard: sorted });
}
