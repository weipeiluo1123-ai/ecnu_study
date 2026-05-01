import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { users, userPosts, likes, bookmarks, views } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";

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

  // Get post count from user_posts only (consistent with "my posts" page)
  const dbPosts = db.select({ slug: userPosts.slug }).from(userPosts).where(eq(userPosts.authorId, session.id)).all();
  const slugList = dbPosts.map(p => p.slug);
  const postCount = slugList.length;

  // Batch compute score: 3 queries total (not N per post)
  let totalScore = 0;
  if (slugList.length > 0) {
    const likesRows = db.select({ slug: likes.postSlug, c: count() }).from(likes).groupBy(likes.postSlug).all() as { slug: string; c: number }[];
    const bmRows = db.select({ slug: bookmarks.postSlug, c: count() }).from(bookmarks).groupBy(bookmarks.postSlug).all() as { slug: string; c: number }[];
    const viewsRows = db.select({ slug: views.postSlug, c: count() }).from(views).groupBy(views.postSlug).all() as { slug: string; c: number }[];

    const slugSet = new Set(slugList);
    const likeMap = new Map(likesRows.filter(r => slugSet.has(r.slug)).map(r => [r.slug, r.c]));
    const bmMap = new Map(bmRows.filter(r => slugSet.has(r.slug)).map(r => [r.slug, r.c]));
    const viewMap = new Map(viewsRows.filter(r => slugSet.has(r.slug)).map(r => [r.slug, r.c]));

    for (const slug of slugList) {
      totalScore += (likeMap.get(slug) || 0) * 5 + (bmMap.get(slug) || 0) * 10 + (viewMap.get(slug) || 0) * 1;
    }
  }

  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email, role: user.role, bio: user.bio, avatar: user.avatar, createdAt: user.createdAt },
    stats: { totalScore, weeklyScore: 0, monthlyScore: 0, postCount },
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
    .set({ bio: bio ?? null, updatedAt: now })
    .where(eq(users.id, session.id))
    .run();

  return NextResponse.json({ ok: true });
}
