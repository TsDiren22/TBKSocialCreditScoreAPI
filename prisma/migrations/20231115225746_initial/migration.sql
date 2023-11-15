-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "messageAmount" INTEGER NOT NULL DEFAULT 0,
    "username" TEXT DEFAULT '',
    "password" TEXT,
    "phone" TEXT
);

-- CreateTable
CREATE TABLE "lastMessageDate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
