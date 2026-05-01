import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { likes, bookmarks, views, comments, users } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { getAllPosts } from "@/lib/posts";

function getDateRange(range: "daily" | "weekly" | "monthly" | "all"): string | null {
  if (range === "all") return null;
  const ms = range === "daily" ? 86400000 : range === "weekly" ? 604800000 : 2592000000;
  return new Date(Date.now() - ms).toISOString();
}

function batchCount(table: any, since: string | null) {
  let q: any = db.select({
    slug: table.postSlug,
    count: count(),
  }).from(table);
  if (since) {
    q = q.where(sql`${table.createdAt} >= ${since}`);
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

    const likeCount = likeMap.get(post.slug) ?? 0;
    const bmCount = bmMap.get(post.slug) ?? 0;
    const viewCount = viewMap.get(post.slug) ?? 0;

    // Only count posts that have interactions in this period
    if (likeCount + bmCount + viewCount > 0) {
      s.postCount++;
    }

    s.totalLikes += likeCount;
    s.totalBookmarks += bmCount;
    s.totalViews += viewCount;
    s.score += likeCount * 5 + bmCount * 10 + viewCount * 1 + 1; // +1 base per interaction
  }

  // Compute unique interactors per author
  const authorSlugs = new Map<number, string[]>();
  for (const post of allPosts) {
    const aid = post.authorId || nameToId.get(post.author);
    if (!aid) continue;
    if (!authorSlugs.has(aid)) authorSlugs.set(aid, []);
    authorSlugs.get(aid)!.push(post.slug);
  }

  const interactorMap = new Map<number, number>();
  for (const [authorId, slugs] of authorSlugs) {
    const uniq = new Set<number>();
    // Count distinct users who liked any of this author's posts
    for (const slug of slugs) {
      const likers = since
        ? db.select({ uid: likes.userId }).from(likes).where(sql`${likes.postSlug} = ${slug} AND ${likes.createdAt} >= ${since}`).all()
        : db.select({ uid: likes.userId }).from(likes).where(sql`${likes.postSlug} = ${slug}`).all();
      const commenters = since
        ? db.select({ uid: comments.authorId }).from(comments).where(sql`${comments.postSlug} = ${slug} AND ${comments.createdAt} >= ${since}`).all()
        : db.select({ uid: comments.authorId }).from(comments).where(sql`${comments.postSlug} = ${slug}`).all();
      const bookmarkers = since
        ? db.select({ uid: bookmarks.userId }).from(bookmarks).where(sql`${bookmarks.postSlug} = ${slug} AND ${bookmarks.createdAt} >= ${since}`).all()
        : db.select({ uid: bookmarks.userId }).from(bookmarks).where(sql`${bookmarks.postSlug} = ${slug}`).all();
      for (const r of likers) if (r.uid) uniq.add(r.uid);
      for (const r of commenters) if (r.uid) uniq.add(r.uid);
      for (const r of bookmarkers) if (r.uid) uniq.add(r.uid);
    }
    interactorMap.set(authorId, uniq.size);
  }

  const sorted = Object.values(scores)
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ rank: i + 1, ...s, interactors: interactorMap.get(s.userId) ?? 0 }));

  return NextResponse.json({ range, leaderboard: sorted });
}
