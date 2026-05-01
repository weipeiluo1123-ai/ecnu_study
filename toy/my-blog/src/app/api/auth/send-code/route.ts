import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { verificationCodes } from "@/lib/db/schema";
import { eq, and, isNull, lt, gte } from "drizzle-orm";
import { sendVerificationCode } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    // Rate limit: check if a code was sent within the last 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const recentCode = db.select().from(verificationCodes).where(
      and(
        eq(verificationCodes.email, email),
        gte(verificationCodes.createdAt, sixtySecondsAgo),
        isNull(verificationCodes.usedAt),
      )
    ).get();

    if (recentCode) {
      return NextResponse.json(
        { error: "请 60 秒后再试" },
        { status: 429 }
      );
    }

    // Delete any previously unused codes for this email
    db.delete(verificationCodes).where(
      and(eq(verificationCodes.email, email), isNull(verificationCodes.usedAt))
    ).run();

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    db.insert(verificationCodes).values({
      email,
      code,
      type: "register",
      expiresAt,
      usedAt: null,
      createdAt: now.toISOString(),
    }).run();

    // Send email (fire-and-forget, don't block on failure)
    try {
      await sendVerificationCode(email, code);
    } catch (mailErr) {
      console.error("Failed to send email:", mailErr);
      return NextResponse.json({ error: "验证码发送失败，请检查邮箱地址或稍后重试" }, { status: 500 });
    }

    return NextResponse.json({ message: "验证码已发送" });
  } catch (err) {
    console.error("Send code error:", err);
    return NextResponse.json({ error: "发送失败，请稍后重试" }, { status: 500 });
  }
}
