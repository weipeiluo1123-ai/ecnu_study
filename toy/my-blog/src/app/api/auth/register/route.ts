import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/index";
import { users, verificationCodes } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { setSessionCookie, parsePermissions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, code } = await req.json();

    if (!username || !email || !password || !code) {
      return NextResponse.json(
        { error: "用户名、邮箱、密码和验证码不能为空" },
        { status: 400 }
      );
    }

    // Validate all inputs BEFORE consuming the code
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度需在 2-20 个字符之间" },
        { status: 400 }
      );
    }

    const reservedUsernames = ["weipeiluo", "admin", "root", "system"];
    if (reservedUsernames.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: "该用户名已被注册" },
        { status: 409 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度不能少于 6 个字符" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Verify the code
    const validCode = db.select().from(verificationCodes).where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.code, code),
        eq(verificationCodes.type, "register"),
        isNull(verificationCodes.usedAt),
      )
    ).get();

    if (!validCode) {
      return NextResponse.json(
        { error: "验证码错误或已过期" },
        { status: 400 }
      );
    }

    if (validCode.expiresAt < now) {
      return NextResponse.json(
        { error: "验证码已过期，请重新发送" },
        { status: 400 }
      );
    }

    const existingUser = db.select().from(users).where(
      eq(users.username, username)
    ).get() || db.select().from(users).where(
      eq(users.email, email)
    ).get();

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名或邮箱已被注册" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Consume code and insert atomically after all async work is done
    db.update(verificationCodes)
      .set({ usedAt: now })
      .where(eq(verificationCodes.id, validCode.id))
      .run();

    let result;
    try {
      result = db.insert(users).values({
        username,
        email,
        passwordHash,
        emailVerified: true,
        role: "user",
        permissions: JSON.stringify({
          canComment: true,
          canPost: true,
          canLike: true,
        }),
        avatar: null,
        bio: null,
        createdAt: now,
        updatedAt: now,
      }).run();
    } catch (insertErr: any) {
      if (insertErr?.message?.includes("UNIQUE")) {
        return NextResponse.json(
          { error: "用户名或邮箱已被注册" },
          { status: 409 }
        );
      }
      throw insertErr;
    }

    const sessionUser = {
      id: Number(result.lastInsertRowid),
      username,
      email,
      role: "user" as const,
      permissions: { canComment: true, canPost: true, canLike: true },
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({
      user: { id: sessionUser.id, username, email, role: "user" },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
