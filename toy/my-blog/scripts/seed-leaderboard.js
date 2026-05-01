/**
 * Seed interaction data for leaderboard demo.
 * Creates likes, bookmarks, and views with varied timestamps.
 */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(process.cwd(), "data", "blog.db");
if (!fs.existsSync(dbPath)) {
  console.log("Database not found, skipping seed.");
  process.exit(0);
}

const db = new Database(dbPath);

// Get all post slugs
const mdxDir = path.join(process.cwd(), "content/posts");
const mdxSlugs = fs.existsSync(mdxDir)
  ? fs.readdirSync(mdxDir).filter(function(f) { return f.endsWith(".md"); }).map(function(f) { return f.replace(/\.md$/, ""); })
  : [];

const dbRows = db.prepare("SELECT slug FROM user_posts WHERE is_published = 1").all();
const dbSlugs = dbRows.map(function(r) { return r.slug; });
var allSlugs = [...new Set([...mdxSlugs, ...dbSlugs])];

console.log("Found " + allSlugs.length + " post slugs");

// Get all user IDs
var userRows = db.prepare("SELECT id FROM users").all();
if (userRows.length === 0) {
  console.log("No users found, skipping.");
  process.exit(0);
}

var now = Date.now();
var DAY = 24 * 60 * 60 * 1000;
function ago(days) { return new Date(now - days * DAY).toISOString(); }

function randUser() {
  return userRows[Math.floor(Math.random() * userRows.length)].id;
}

// Insert likes
console.log("Seeding likes...");
var insertLike = db.prepare(
  "INSERT OR IGNORE INTO likes (post_slug, user_id, created_at) VALUES (?, ?, ?)"
);

db.transaction(function() {
  allSlugs.forEach(function(slug) {
    if (Math.random() > 0.3) insertLike.run(slug, randUser(), ago(45 + Math.floor(Math.random() * 15)));
    if (Math.random() > 0.4) insertLike.run(slug, randUser(), ago(10 + Math.floor(Math.random() * 25)));
    if (Math.random() > 0.5) insertLike.run(slug, randUser(), ago(Math.floor(Math.random() * 9)));
  });
})();

// Insert bookmarks
console.log("Seeding bookmarks...");
var insertBm = db.prepare(
  "INSERT OR IGNORE INTO bookmarks (post_slug, user_id, created_at) VALUES (?, ?, ?)"
);

db.transaction(function() {
  allSlugs.forEach(function(slug) {
    if (Math.random() > 0.5) insertBm.run(slug, randUser(), ago(40 + Math.floor(Math.random() * 20)));
    if (Math.random() > 0.6) insertBm.run(slug, randUser(), ago(8 + Math.floor(Math.random() * 30)));
  });
})();

// Insert views
console.log("Seeding views...");
var insertView = db.prepare(
  "INSERT INTO views (post_slug, visitor_id, created_at) VALUES (?, ?, ?)"
);

db.transaction(function() {
  allSlugs.forEach(function(slug) {
    var count = 3 + Math.floor(Math.random() * 10);
    for (var i = 0; i < count; i++) {
      var daysAgo = Math.floor(Math.random() * 50);
      insertView.run(slug, "visitor_" + Math.floor(Math.random() * 100), ago(daysAgo));
    }
  });
})();

console.log("Seed complete!");
db.close();
