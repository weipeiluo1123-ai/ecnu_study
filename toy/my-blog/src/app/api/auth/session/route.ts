import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Fetch fresh user data from DB (in case of name changes, role changes, etc.)
  const freshUser = db.select().from(users).where(eq(users.id, session.id)).get();
  if (!freshUser) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: freshUser.id,
      username: freshUser.username,
      email: freshUser.email,
      role: freshUser.role,
    },
  });
}
