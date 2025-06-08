/*
  Warnings:

  - You are about to drop the column `search_vector` on the `MiniNews` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "search_vector_idx";

-- AlterTable
ALTER TABLE "MiniNews" DROP COLUMN "search_vector";

-- CreateTable
CREATE TABLE "Bookmark" (
    "userId" TEXT NOT NULL,
    "miniNewsId" TEXT NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("userId","miniNewsId")
);

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_miniNewsId_fkey" FOREIGN KEY ("miniNewsId") REFERENCES "MiniNews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
