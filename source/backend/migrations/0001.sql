CREATE TABLE IF NOT EXISTS "users" (
	"id" INTEGER PRIMARY KEY,
	"name" TEXT,
	"email" TEXT NOT NULL UNIQUE,
	"username" TEXT UNIQUE,
	"description" TEXT,
	"avatarUrl" TEXT
);

CREATE TABLE IF NOT EXISTS "tokens" (
	"id" INTEGER PRIMARY KEY,
	"userId" INTEGER,
	"type" TEXT,
	"value" TEXT,
	"expireAt" INTEGER DEFAULT (strftime('%s','now','+5 minutes') || substr(strftime('%f','now'),4)),
	FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "articles" (
	"id" INTEGER PRIMARY KEY,
	"userId" INTEGER,
	"uuid" TEXT,
	"title" TEXT,
	"description" TEXT,
	"slug" TEXT,
	"content" TEXT,
	"published" INTEGER DEFAULT 0,
	"publishedDate" INTEGER,
	"pinnedDate" INTEGER,
	FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE,
	UNIQUE("userId", "slug")
);