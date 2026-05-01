import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPostAnalytics } from "@/lib/dashboard";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "admin" && session.role !== "super_admin")) {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug 参数" }, { status: 400 });
  }

  try {
    const analytics = getPostAnalytics(slug);
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json({ error: "数据加载失败" }, { status: 500 });
  }
}
