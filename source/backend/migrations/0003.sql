PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;
CREATE TABLE "temp" (
	"id" INTEGER PRIMARY KEY,
	"userId" INTEGER,
	"uuid" TEXT,
	"title" TEXT,
	"description" TEXT,
	"slug" TEXT,
	"content" TEXT,
	"published" INTEGER DEFAULT 0,
	"publishedAt" INTEGER,
	"pinnedAt" INTEGER,
	"createdAt" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4)),
	"updatedAt" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4)),
	FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
	UNIQUE("userId", "slug")
);

INSERT INTO "temp"("id", "userId", "uuid", "title", "description", "slug", "content", "published", "publishedAt", "pinnedAt") SELECT "id", "userId", "uuid", "title", "description", "slug", "content", "published", "publishedDate", "pinnedDate" FROM "articles";

DROP TABLE articles;
ALTER TABLE temp RENAME TO articles; 
COMMIT;

BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "temp" (
	"id" INTEGER PRIMARY KEY,
	"name" TEXT,
	"email" TEXT NOT NULL UNIQUE,
	"username" TEXT UNIQUE,
	"description" TEXT,
	"avatarUrl" TEXT,
	"createdAt" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4)),
	"updatedAt" INTEGER DEFAULT (strftime('%s','now') || substr(strftime('%f','now'),4))
);

INSERT INTO "temp"("id", "name", "email", "username", "description", "avatarUrl") SELECT "id", "name", "email", "username", "description", "avatarUrl" FROM "users";

DROP TABLE users;
ALTER TABLE temp RENAME TO users; 
COMMIT;

PRAGMA foreign_keys = ON;