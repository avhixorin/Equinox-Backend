/*
  Warnings:

  - The primary key for the `MiniNews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `News` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "MiniNews" DROP CONSTRAINT "MiniNews_newsId_fkey";

-- AlterTable
ALTER TABLE "MiniNews" DROP CONSTRAINT "MiniNews_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "newsId" SET DATA TYPE TEXT,
ADD CONSTRAINT "MiniNews_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MiniNews_id_seq";

-- AlterTable
ALTER TABLE "News" DROP CONSTRAINT "News_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "News_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "News_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "MiniNews" ADD CONSTRAINT "MiniNews_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
