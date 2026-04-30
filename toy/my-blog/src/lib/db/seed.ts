import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

const DEFAULT_ADMIN = {
  username: "admin",
  email: "admin@nexus.blog",
  password: "admin123",
};

export async function seedAdmin() {
  const existing = db.select().from(users).where(
    Object.assign({ role: "admin" }) as any
  ).all();

  if (existing.length > 0) return;

  const hash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
  const now = new Date().toISOString();

  db.insert(users).values({
    username: DEFAULT_ADMIN.username,
    email: DEFAULT_ADMIN.email,
    passwordHash: hash,
    role: "admin",
    permissions: JSON.stringify({
      canComment: true,
      canPost: true,
      canLike: true,
    }),
    avatar: null,
    bio: "博客管理员",
    createdAt: now,
    updatedAt: now,
  }).run();

  console.log("✅ Admin user seeded: admin / admin123");
}
