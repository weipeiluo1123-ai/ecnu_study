import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db/index";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "nexus-blog-dev-secret-key-2026"
);

const COOKIE_NAME = "nexus_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  permissions: Record<string, boolean>;
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function parsePermissions(permStr: string | null): Record<string, boolean> {
  try {
    return permStr ? JSON.parse(permStr) : {};
  } catch {
    return {};
  }
}

export function canUser(
  user: SessionUser | null,
  permission: string
): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "super_admin") return true;
  return user.permissions[permission] === true;
}
