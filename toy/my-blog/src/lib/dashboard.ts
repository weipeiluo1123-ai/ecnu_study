import { db } from "@/lib/db/index";
import { views, likes, bookmarks, comments, userPosts } from "@/lib/db/schema";
import { count, sql } from "drizzle-orm";
import { getAllPosts } from "@/lib/posts";

type QueryRow = { slug?: string; hour?: string; c: number; uid?: number };

export interface OverviewStats {
  totalViews: number;
  activeUsers: number;
  newPosts: number;
  totalInteractions: number;
}

export interface HourlyCount {
  hour: string;
  count: number;
}

export interface TopPost {
  slug: string;
  title: string;
  authorName: string;
  views: number;
  likes: number;
  bookmarks: number;
  comments: number;
}

export interface EngagementData {
  hour: string;
  likes: number;
  comments: number;
  bookmarks: number;
}

export interface PostAnalytics {
  hourlyViews: HourlyCount[];
  hourlyLikes: HourlyCount[];
  hourlyBookmarks: HourlyCount[];
}

function getSince(range: string): string | null {
  if (range === "all") return null;
  const now = Date.now();
  const ms = range === "24h" ? 86400000
    : range === "7d" ? 604800000
    : range === "30d" ? 2592000000
    : 86400000;
  return new Date(now - ms).toISOString();
}

/** Format hour label from ISO string — extracts "HH:00" */
const hourSql = sql<string>`substr(${views.createdAt}, 12, 2) || ':00'`;
const hourSqlLike = sql<string>`substr(${likes.createdAt}, 12, 2) || ':00'`;
const hourSqlBm = sql<string>`substr(${bookmarks.createdAt}, 12, 2) || ':00'`;
const hourSqlComment = sql<string>`substr(${comments.createdAt}, 12, 2) || ':00'`;

export function getOverviewStats(range: string = "24h"): OverviewStats {
  try {
    const since = getSince(range);

    const totalViews = since
      ? db.select({ c: count() }).from(views).where(sql`${views.createdAt} >= ${since}`).get()
      : db.select({ c: count() }).from(views).get();

    // Combined active users: distinct users who liked, bookmarked, or commented
    const activeUsers = (() => {
      const [likeUsers, bmUsers, commentUsers] = since
        ? [
            db.select({ uid: likes.userId }).from(likes).where(sql`${likes.createdAt} >= ${since}`).all(),
            db.select({ uid: bookmarks.userId }).from(bookmarks).where(sql`${bookmarks.createdAt} >= ${since}`).all(),
            db.select({ uid: comments.authorId }).from(comments).where(sql`${comments.createdAt} >= ${since}`).all(),
          ]
        : [
            db.select({ uid: likes.userId }).from(likes).all(),
            db.select({ uid: bookmarks.userId }).from(bookmarks).all(),
            db.select({ uid: comments.authorId }).from(comments).all(),
          ];
      const s = new Set<number>();
      likeUsers.forEach(u => u.uid !== null && s.add(u.uid));
      bmUsers.forEach(u => s.add(u.uid));
      commentUsers.forEach(u => u.uid !== null && s.add(u.uid));
      return s.size;
    })();

    const newPosts = since
      ? db.select({ c: count() }).from(userPosts).where(sql`${userPosts.createdAt} >= ${since}`).get()
      : db.select({ c: count() }).from(userPosts).get();

    const interactions = (() => {
      const [l, b, c] = since
        ? [
            db.select({ c: count() }).from(likes).where(sql`${likes.createdAt} >= ${since}`).get(),
            db.select({ c: count() }).from(bookmarks).where(sql`${bookmarks.createdAt} >= ${since}`).get(),
            db.select({ c: count() }).from(comments).where(sql`${comments.createdAt} >= ${since}`).get(),
          ]
        : [
            db.select({ c: count() }).from(likes).get(),
            db.select({ c: count() }).from(bookmarks).get(),
            db.select({ c: count() }).from(comments).get(),
          ];
      return (l?.c ?? 0) + (b?.c ?? 0) + (c?.c ?? 0);
    })();

    return {
      totalViews: totalViews?.c ?? 0,
      activeUsers,
      newPosts: newPosts?.c ?? 0,
      totalInteractions: interactions,
    };
  } catch (e) {
    console.error("getOverviewStats failed", e);
    return { totalViews: 0, activeUsers: 0, newPosts: 0, totalInteractions: 0 };
  }
}

export function getHourlyViews(range: string = "24h"): HourlyCount[] {
  try {
    const since = getSince(range);
    const rows = (since
      ? db.select({
          hour: hourSql,
          c: count(),
        }).from(views).where(sql`${views.createdAt} >= ${since}`)
      : db.select({
          hour: hourSql,
          c: count(),
        }).from(views)
    ).groupBy(sql`substr(${views.createdAt}, 12, 2)`).orderBy(sql`substr(${views.createdAt}, 12, 2)`).all() as QueryRow[];

    return fillMissingHours(rows.map(r => ({ hour: r.hour as string, count: Number(r.c) })));
  } catch (e) {
    console.error("getHourlyViews failed", e);
    return fillMissingHours([]);
  }
}

export function getHourlyEngagement(range: string = "24h"): EngagementData[] {
  try {
    const since = getSince(range);

    const likesRows = (since
      ? db.select({ hour: sql<string>`substr(${likes.createdAt}, 12, 2) || ':00'`, c: count() }).from(likes).where(sql`${likes.createdAt} >= ${since}`)
      : db.select({ hour: sql<string>`substr(${likes.createdAt}, 12, 2) || ':00'`, c: count() }).from(likes)
    ).groupBy(sql`substr(${likes.createdAt}, 12, 2)`).orderBy(sql`substr(${likes.createdAt}, 12, 2)`).all() as QueryRow[];

    const commentsRows = (since
      ? db.select({ hour: sql<string>`substr(${comments.createdAt}, 12, 2) || ':00'`, c: count() }).from(comments).where(sql`${comments.createdAt} >= ${since}`)
      : db.select({ hour: sql<string>`substr(${comments.createdAt}, 12, 2) || ':00'`, c: count() }).from(comments)
    ).groupBy(sql`substr(${comments.createdAt}, 12, 2)`).orderBy(sql`substr(${comments.createdAt}, 12, 2)`).all() as QueryRow[];

    const bmRows = (since
      ? db.select({ hour: sql<string>`substr(${bookmarks.createdAt}, 12, 2) || ':00'`, c: count() }).from(bookmarks).where(sql`${bookmarks.createdAt} >= ${since}`)
      : db.select({ hour: sql<string>`substr(${bookmarks.createdAt}, 12, 2) || ':00'`, c: count() }).from(bookmarks)
    ).groupBy(sql`substr(${bookmarks.createdAt}, 12, 2)`).orderBy(sql`substr(${bookmarks.createdAt}, 12, 2)`).all() as QueryRow[];

    const likesMap = new Map(likesRows.map(r => [r.hour as string, Number(r.c)]));
    const commentsMap = new Map(commentsRows.map(r => [r.hour as string, Number(r.c)]));
    const bmMap = new Map(bmRows.map(r => [r.hour as string, Number(r.c)]));

    const result: EngagementData[] = [];
    for (let i = 0; i < 24; i++) {
      const h = String(i).padStart(2, "0") + ":00";
      result.push({
        hour: h,
        likes: likesMap.get(h) ?? 0,
        comments: commentsMap.get(h) ?? 0,
        bookmarks: bmMap.get(h) ?? 0,
      });
    }
    return result;
  } catch (e) {
    console.error("getHourlyEngagement failed", e);
    return Array.from({ length: 24 }, (_, i) => ({
      hour: String(i).padStart(2, "0") + ":00",
      likes: 0, comments: 0, bookmarks: 0,
    }));
  }
}

export function getTopPosts(
  range: string = "24h",
  sortBy: "views" | "likes" | "bookmarks" = "views",
  limit: number = 10
): TopPost[] {
  try {
    const since = getSince(range);

    const viewsBatch = since
      ? db.select({ slug: views.postSlug, c: count() }).from(views).where(sql`${views.createdAt} >= ${since}`).groupBy(views.postSlug).all() as QueryRow[]
      : db.select({ slug: views.postSlug, c: count() }).from(views).groupBy(views.postSlug).all() as QueryRow[];

    const likesBatch = since
      ? db.select({ slug: likes.postSlug, c: count() }).from(likes).where(sql`${likes.createdAt} >= ${since}`).groupBy(likes.postSlug).all() as QueryRow[]
      : db.select({ slug: likes.postSlug, c: count() }).from(likes).groupBy(likes.postSlug).all() as QueryRow[];

    const bmBatch = since
      ? db.select({ slug: bookmarks.postSlug, c: count() }).from(bookmarks).where(sql`${bookmarks.createdAt} >= ${since}`).groupBy(bookmarks.postSlug).all() as QueryRow[]
      : db.select({ slug: bookmarks.postSlug, c: count() }).from(bookmarks).groupBy(bookmarks.postSlug).all() as QueryRow[];

    const commentBatch = since
      ? db.select({ slug: comments.postSlug, c: count() }).from(comments).where(sql`${comments.createdAt} >= ${since}`).groupBy(comments.postSlug).all() as QueryRow[]
      : db.select({ slug: comments.postSlug, c: count() }).from(comments).groupBy(comments.postSlug).all() as QueryRow[];

    const viewsMap = new Map(viewsBatch.map(r => [r.slug, Number(r.c)]));
    const likesMap = new Map(likesBatch.map(r => [r.slug, Number(r.c)]));
    const bmMap = new Map(bmBatch.map(r => [r.slug, Number(r.c)]));
    const commentMap = new Map(commentBatch.map(r => [r.slug, Number(r.c)]));

    // Collect all slugs from all 4 sources
    const allSlugs = new Set<string>();
    viewsBatch.forEach(r => allSlugs.add(r.slug!));
    likesBatch.forEach(r => allSlugs.add(r.slug!));
    bmBatch.forEach(r => allSlugs.add(r.slug!));
    commentBatch.forEach(r => allSlugs.add(r.slug!));

    const posts = db.select({
      slug: userPosts.slug,
      title: userPosts.title,
    }).from(userPosts).all();

    const postMap = new Map(posts.map(p => [p.slug, p.title]));

    // Also include MDX post titles (not in userPosts)
    for (const p of getAllPosts()) {
      if (!postMap.has(p.slug)) {
        postMap.set(p.slug, p.title);
      }
    }

    const result: TopPost[] = [];
    for (const slug of allSlugs) {
      const v = viewsMap.get(slug) ?? 0;
      const l = likesMap.get(slug) ?? 0;
      const b = bmMap.get(slug) ?? 0;
      const c = commentMap.get(slug) ?? 0;
      const title = postMap.get(slug) ?? slug;
      result.push({ slug, title, authorName: "", views: v, likes: l, bookmarks: b, comments: c });
    }

    const sortKey = sortBy === "likes" ? "likes" as const
      : sortBy === "bookmarks" ? "bookmarks" as const
      : "views" as const;

    return result.sort((a, b) => b[sortKey] - a[sortKey]).slice(0, limit);
  } catch (e) {
    console.error("getTopPosts failed", e);
    return [];
  }
}

export function getPostAnalytics(postSlug: string): PostAnalytics {
  try {
    const hourlyViews = db.select({
      hour: sql<string>`substr(${views.createdAt}, 12, 2) || ':00'`,
      c: count(),
    }).from(views).where(sql`${views.postSlug} = ${postSlug}`)
      .groupBy(sql`substr(${views.createdAt}, 12, 2)`)
      .orderBy(sql`substr(${views.createdAt}, 12, 2)`)
      .all() as QueryRow[];

    const hourlyLikes = db.select({
      hour: sql<string>`substr(${likes.createdAt}, 12, 2) || ':00'`,
      c: count(),
    }).from(likes).where(sql`${likes.postSlug} = ${postSlug}`)
      .groupBy(sql`substr(${likes.createdAt}, 12, 2)`)
      .orderBy(sql`substr(${likes.createdAt}, 12, 2)`)
      .all() as QueryRow[];

    const hourlyBm = db.select({
      hour: sql<string>`substr(${bookmarks.createdAt}, 12, 2) || ':00'`,
      c: count(),
    }).from(bookmarks).where(sql`${bookmarks.postSlug} = ${postSlug}`)
      .groupBy(sql`substr(${bookmarks.createdAt}, 12, 2)`)
      .orderBy(sql`substr(${bookmarks.createdAt}, 12, 2)`)
      .all() as QueryRow[];

    return {
      hourlyViews: fillMissingHours(hourlyViews.map(r => ({ hour: r.hour as string, count: Number(r.c) }))),
      hourlyLikes: fillMissingHours(hourlyLikes.map(r => ({ hour: r.hour as string, count: Number(r.c) }))),
      hourlyBookmarks: fillMissingHours(hourlyBm.map(r => ({ hour: r.hour as string, count: Number(r.c) }))),
    };
  } catch (e) {
    console.error("getPostAnalytics failed", e);
    return { hourlyViews: fillMissingHours([]), hourlyLikes: fillMissingHours([]), hourlyBookmarks: fillMissingHours([]) };
  }
}

function fillMissingHours(data: HourlyCount[]): HourlyCount[] {
  const map = new Map(data.map(d => [d.hour, d.count]));
  const result: HourlyCount[] = [];
  for (let i = 0; i < 24; i++) {
    const h = String(i).padStart(2, "0") + ":00";
    result.push({ hour: h, count: map.get(h) ?? 0 });
  }
  return result;
}
