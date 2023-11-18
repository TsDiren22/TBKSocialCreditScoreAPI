-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "messageAmount" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_user" ("id", "messageAmount", "name", "password", "phone", "points", "username") SELECT "id", "messageAmount", "name", coalesce("password", '') AS "password", coalesce("phone", '') AS "phone", "points", coalesce("username", '') AS "username" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
