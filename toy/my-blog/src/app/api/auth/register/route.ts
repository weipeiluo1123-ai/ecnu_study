import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSessionCookie, parsePermissions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "用户名、邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度需在 2-20 个字符之间" },
        { status: 400 }
      );
    }

    // Prevent registration with reserved system usernames
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
    const now = new Date().toISOString();

    const result = db.insert(users).values({
      username,
      email,
      passwordHash,
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
