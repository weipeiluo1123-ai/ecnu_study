import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { likes, bookmarks, views, users } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { getAllPosts } from "@/lib/posts";

function getDateRange(range: "daily" | "weekly" | "monthly" | "all"): Date | null {
  if (range === "all") return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // today 00:00
  switch (range) {
    case "daily":
      return start;
    case "weekly": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as week start
      return new Date(start.getTime() + mondayOffset * 24 * 60 * 60 * 1000);
    }
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function batchCount(table: any, since: Date | null) {
  let q: any = db.select({
    slug: table.postSlug,
    count: count(),
  }).from(table);
  if (since) {
    q = q.where(sql`${table.createdAt} >= ${since.toISOString()}`);
  }
  return q.groupBy(table.postSlug).all() as { slug: string; count: number }[];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") || "all") as "daily" | "weekly" | "monthly" | "all";
  const since = getDateRange(range);

  // Batch aggregate queries — only 3 queries total regardless of post count
  const likesBatch = batchCount(likes, since);
  const bmBatch = batchCount(bookmarks, since);
  const viewsBatch = batchCount(views, since);

  const likeMap = new Map(likesBatch.map(r => [r.slug, r.count]));
  const bmMap = new Map(bmBatch.map(r => [r.slug, r.count]));
  const viewMap = new Map(viewsBatch.map(r => [r.slug, r.count]));

  // Get ALL posts (MDX + user_posts) with author info
  const allPosts = getAllPosts();

  // Batch lookup: map username→id for MDX posts whose authorId may be stale
  const nameToId = new Map<string, number>();
  const allUsers = db.select({ id: users.id, username: users.username }).from(users).all();
  for (const u of allUsers) {
    nameToId.set(u.username, u.id);
  }

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
    const effectiveAuthorId = post.authorId || nameToId.get(post.author);
    if (!effectiveAuthorId) continue;

    if (!scores[effectiveAuthorId]) {
      scores[effectiveAuthorId] = {
        userId: effectiveAuthorId,
        username: post.author,
        score: 0,
        postCount: 0,
        totalLikes: 0,
        totalViews: 0,
        totalBookmarks: 0,
      };
    }

    const s = scores[effectiveAuthorId];
    s.postCount++;

    const likeCount = likeMap.get(post.slug) ?? 0;
    const bmCount = bmMap.get(post.slug) ?? 0;
    const viewCount = viewMap.get(post.slug) ?? 0;

    s.totalLikes += likeCount;
    s.totalBookmarks += bmCount;
    s.totalViews += viewCount;
    s.score += likeCount * 5 + bmCount * 10 + viewCount * 1;
  }

  const sorted = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ rank: i + 1, ...s }));

  return NextResponse.json({ range, leaderboard: sorted });
}
