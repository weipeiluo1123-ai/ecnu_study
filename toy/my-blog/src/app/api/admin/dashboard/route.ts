import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOverviewStats, getHourlyViews, getHourlyEngagement, getTopPosts } from "@/lib/dashboard";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "24h";
  const sortBy = (searchParams.get("sortBy") || "views") as "views" | "likes" | "bookmarks";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const [overview, hourlyViews, hourlyEngagement, topPosts] = await Promise.all([
      getOverviewStats(range),
      getHourlyViews(range),
      getHourlyEngagement(range),
      getTopPosts(range, sortBy, limit),
    ]);

    return NextResponse.json({ overview, hourlyViews, hourlyEngagement, topPosts });
  } catch {
    return NextResponse.json({ error: "数据加载失败" }, { status: 500 });
  }
}
