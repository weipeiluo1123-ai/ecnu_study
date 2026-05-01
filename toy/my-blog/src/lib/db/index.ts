import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, "blog.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Auto-create tables
export function initDB() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin')),
      avatar TEXT,
      bio TEXT,
      permissions TEXT DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug TEXT NOT NULL,
      author_id INTEGER,
      author_name TEXT,
      content TEXT NOT NULL,
      parent_id INTEGER REFERENCES comments(id),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL,
      UNIQUE(post_slug, user_id)
    );

    CREATE TABLE IF NOT EXISTS views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug TEXT NOT NULL,
      visitor_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL,
      UNIQUE(post_slug, user_id)
    );

    CREATE TABLE IF NOT EXISTS user_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      description TEXT,
      slug TEXT NOT NULL UNIQUE,
      category TEXT DEFAULT 'notes',
      tags TEXT DEFAULT '[]',
      author_id INTEGER NOT NULL REFERENCES users(id),
      is_published INTEGER NOT NULL DEFAULT 1,
      likes_count INTEGER NOT NULL DEFAULT 0,
      views_count INTEGER NOT NULL DEFAULT 0,
      bookmarks_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug);
    CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_slug);
    CREATE INDEX IF NOT EXISTS idx_views_post ON views(post_slug);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_slug);
    CREATE INDEX IF NOT EXISTS idx_user_posts_author ON user_posts(author_id);

    CREATE TABLE IF NOT EXISTS name_change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      old_name TEXT NOT NULL,
      new_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      reviewed_by INTEGER REFERENCES users(id),
      reviewed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'register',
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
    CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
  `);

  // Migration: add author_name column to comments if not exists
  try {
    const cols = sqlite.prepare("PRAGMA table_info(comments)").all() as any[];
    const hasAuthorName = cols.some((c: any) => c.name === "author_name");
    const isAuthorIdNullable = cols.some((c: any) => c.name === "author_id" && c.notnull === 0);

    if (!hasAuthorName) {
      sqlite.exec(`
        ALTER TABLE comments ADD COLUMN author_name TEXT;
      `);
    }

    // If author_id is still NOT NULL, recreate the table
    if (!isAuthorIdNullable) {
      sqlite.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE comments_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_slug TEXT NOT NULL,
          author_id INTEGER,
          author_name TEXT,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        INSERT INTO comments_new SELECT id, post_slug, author_id, author_name, content, created_at FROM comments;
        DROP TABLE comments;
        ALTER TABLE comments_new RENAME TO comments;
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (e) {
    // Migration may fail if DB is new; that's OK
  }

  // Migration: add parent_id column to comments for nested replies
  try {
    const commentCols = sqlite.prepare("PRAGMA table_info(comments)").all() as any[];
    const hasParentId = commentCols.some((c: any) => c.name === "parent_id");
    if (!hasParentId) {
      sqlite.exec(`ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id);`);
    }
  } catch (e) {
    // Migration may fail; that's OK
  }

  // Migration: ensure role column supports super_admin
  try {
    const tableInfo = sqlite.prepare("PRAGMA table_info(users)").all() as any[];
    // Need to recreate the table if the CHECK constraint doesn't include super_admin
    const roleDef = tableInfo.find((c: any) => c.name === "role");
    if (roleDef && !roleDef.dflt_value?.includes("super_admin")) {
      sqlite.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin')),
          avatar TEXT,
          bio TEXT,
          permissions TEXT DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        INSERT INTO users_new SELECT * FROM users;
        DROP TABLE users;
        ALTER TABLE users_new RENAME TO users;
        PRAGMA foreign_keys = ON;
      `);
    }
  } catch (e) {
    // Migration may fail; that's OK
  }

  // Migration: add email_verified column to users if not exists
  try {
    const userCols = sqlite.prepare("PRAGMA table_info(users)").all() as any[];
    const hasEmailVerified = userCols.some((c: any) => c.name === "email_verified");
    if (!hasEmailVerified) {
      sqlite.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;`);
    }
  } catch (e) {
    // Migration may fail; that's OK
  }

  // Migration: add format column to user_posts if not exists
  try {
    const postCols = sqlite.prepare("PRAGMA table_info(user_posts)").all() as any[];
    const hasFormat = postCols.some((c: any) => c.name === "format");
    if (!hasFormat) {
      sqlite.exec(`ALTER TABLE user_posts ADD COLUMN format TEXT NOT NULL DEFAULT 'markdown';`);
    }
  } catch (e) {
    // Migration may fail; that's OK
  }
}

initDB();

// Seed admin user if not exists
try {
  const row = sqlite.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!row) {
    const bcrypt = require("bcryptjs");
    const hash = bcrypt.hashSync("admin123", 10);
    const seedDate = "2026-03-15T08:00:00.000Z";
    const perms = JSON.stringify({ canComment: true, canPost: true, canLike: true });
    sqlite.prepare(`
      INSERT INTO users (username, email, password_hash, role, permissions, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run("admin", "admin@nexus.blog", hash, "admin", perms, seedDate, seedDate);
    console.log("✅ Admin user seeded: admin / admin123");
  }
} catch (e) {
  // Silent fail
}

// Seed test users if not present
try {
  const testUsers = [
    { username: "morn1ng", email: "morn1ng@nexus.blog", bio: "早起的人儿有代码写" },
    { username: "alice", email: "alice@nexus.blog", bio: "全栈工程师，热爱开源" },
    { username: "bob", email: "bob@nexus.blog", bio: "后端开发，Go & Rust 爱好者" },
  ];
  const bcrypt = require("bcryptjs");
  const seedDate = "2026-03-15T08:00:00.000Z";
  for (const u of testUsers) {
    const existing = sqlite.prepare("SELECT id FROM users WHERE username = ?").get(u.username);
    if (!existing) {
      const hash = bcrypt.hashSync("123456", 10);
      const perms = JSON.stringify({ canComment: true, canPost: true, canLike: true });
      sqlite.prepare(`
        INSERT INTO users (username, email, password_hash, role, permissions, bio, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(u.username, u.email, hash, "user", perms, u.bio, seedDate, seedDate);
      console.log(`✅ Test user seeded: ${u.username} / 123456`);
    }
  }
} catch (e) {
  // Silent fail
}

// Seed super admin weipeiluo if not exists
try {
  const existing = sqlite.prepare("SELECT id FROM users WHERE username = ?").get("weipeiluo");
  if (!existing) {
    const bcrypt = require("bcryptjs");
    const hash = bcrypt.hashSync("weipeiluo123", 10);
    const seedDate = "2026-03-15T08:00:00.000Z";
    const perms = JSON.stringify({ canComment: true, canPost: true, canLike: true });
    sqlite.prepare(`
      INSERT INTO users (username, email, password_hash, role, permissions, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("weipeiluo", "weipeiluo@nexus.blog", hash, "super_admin", perms, "Nexus Blog 创始人 · 全栈开发者 · 开源爱好者", seedDate, seedDate);
    console.log("✅ Super admin seeded: weipeiluo / weipeiluo123");
  }
} catch (e) {
  // Silent fail
}
