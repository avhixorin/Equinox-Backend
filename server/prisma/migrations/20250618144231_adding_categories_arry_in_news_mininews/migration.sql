/*
  Warnings:

  - You are about to drop the column `search_vector` on the `MiniNews` table. All the data in the column will be lost.
  - The `category` column on the `MiniNews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category` column on the `News` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/

-- AlterTable
ALTER TABLE "MiniNews" DROP COLUMN "search_vector",
DROP COLUMN "category",
ADD COLUMN     "category" TEXT[];

-- AlterTable
ALTER TABLE "News" DROP COLUMN "category",
ADD COLUMN     "category" TEXT[];
