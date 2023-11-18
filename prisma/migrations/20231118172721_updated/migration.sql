-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "messageAmount" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT DEFAULT '',
    "password" TEXT DEFAULT '',
    "phone" TEXT
);
INSERT INTO "new_user" ("id", "messageAmount", "name", "password", "phone", "points", "username") SELECT "id", "messageAmount", "name", "password", "phone", "points", "username" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
