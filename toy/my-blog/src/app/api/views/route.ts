import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { views, userPosts } from "@/lib/db/schema";
import { eq, and, count, gte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { postSlug, visitorId } = await req.json();
  if (!postSlug) return NextResponse.json({ error: "缺少 postSlug" }, { status: 400 });

  const vid = visitorId || "anonymous";

  // Dedup: skip if this visitor viewed this post within the last hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const recent = db.select().from(views).where(
    and(
      eq(views.postSlug, postSlug),
      eq(views.visitorId, vid),
      gte(views.createdAt, oneHourAgo),
    )
  ).get();

  if (!recent) {
    db.insert(views).values({
      postSlug,
      visitorId: vid,
      createdAt: new Date().toISOString(),
    }).run();
  }

  const total = db.select({ count: count() }).from(views)
    .where(eq(views.postSlug, postSlug))
    .get();

  // Sync user_posts aggregate count
  db.update(userPosts)
    .set({ viewsCount: total?.count || 0 })
    .where(eq(userPosts.slug, postSlug))
    .run();

  return NextResponse.json({ count: total?.count || 0 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");

  if (!postSlug) {
    return NextResponse.json({ error: "缺少 postSlug" }, { status: 400 });
  }

  const total = db.select({ count: count() }).from(views)
    .where(eq(views.postSlug, postSlug))
    .get();

  return NextResponse.json({ count: total?.count || 0 });
}
