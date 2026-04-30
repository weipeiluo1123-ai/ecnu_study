import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { setSessionCookie, parsePermissions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const user = db.select().from(users).where(
      eq(users.username, username)
    ).get();

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as "user" | "admin" | "super_admin",
      permissions: parsePermissions(user.permissions),
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
