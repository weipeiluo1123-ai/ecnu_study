/**
 * Seed interaction data for leaderboard demo.
 * Creates likes, bookmarks, and views with varied timestamps
 * so daily/weekly/monthly/all leaderboards show different results.
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "blog.db");
if (!fs.existsSync(dbPath)) {
  console.log("Database not found, skipping seed.");
  process.exit(0);
}

const db = new Database(dbPath);

// Get all post slugs (both from content/posts/ and user_posts table)
const mdxSlugs = fs.readdirSync(path.join(process.cwd(), "content/posts"))
  .filter(f => f.endsWith(".md"))
  .map(f => f.replace(/\.md$/, ""));

const dbSlugs = db.prepare("SELECT slug FROM user_posts WHERE is_published = 1").all();
const allSlugs = [...new Set([...mdxSlugs, ...dbSlugs.map(r => r.slug)])];

console.log(`Found ${allSlugs.length} post slugs`);

// Get all user IDs
const users = db.prepare("SELECT id FROM users").all();
if (users.length === 0) {
  console.log("No users found, skipping.");
  process.exit(0);
}

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

// Helper to create a date string relative to now
const ago = (days: number) => new Date(now - days * DAY).toISOString();

// Insert likes with varied timestamps
console.log("Seeding likes...");
const insertLike = db.prepare(
  "INSERT OR IGNORE INTO likes (post_slug, user_id, created_at) VALUES (?, ?, ?)"
);

const likeInserts = db.transaction(() => {
  for (const slug of allSlugs) {
    const userId = users[Math.floor(Math.random() * users.length)].id;
    // Some old likes (40+ days ago)
    if (Math.random() > 0.3) insertLike.run(slug, userId, ago(45 + Math.floor(Math.random() * 15)));
    // Some medium likes (10-35 days ago)
    if (Math.random() > 0.4) insertLike.run(slug, userId, ago(10 + Math.floor(Math.random() * 25)));
    // Some recent likes (0-9 days ago)
    if (Math.random() > 0.5) insertLike.run(slug, userId, ago(Math.floor(Math.random() * 9)));
  }
});
likeInserts();

// Insert bookmarks with varied timestamps
console.log("Seeding bookmarks...");
const insertBm = db.prepare(
  "INSERT OR IGNORE INTO bookmarks (post_slug, user_id, created_at) VALUES (?, ?, ?)"
);

const bmInserts = db.transaction(() => {
  for (const slug of allSlugs) {
    const userId = users[Math.floor(Math.random() * users.length)].id;
    if (Math.random() > 0.5) insertBm.run(slug, userId, ago(40 + Math.floor(Math.random() * 20)));
    if (Math.random() > 0.6) insertBm.run(slug, userId, ago(8 + Math.floor(Math.random() * 30)));
  }
});
bmInserts();

// Insert views with varied timestamps
console.log("Seeding views...");
const insertView = db.prepare(
  "INSERT INTO views (post_slug, visitor_id, created_at) VALUES (?, ?, ?)"
);

const viewInserts = db.transaction(() => {
  for (const slug of allSlugs) {
    const count = 3 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 50);
      insertView.run(slug, `visitor_${Math.floor(Math.random() * 100)}`, ago(daysAgo));
    }
  }
});
viewInserts();

console.log("Seed complete!");
db.close();
