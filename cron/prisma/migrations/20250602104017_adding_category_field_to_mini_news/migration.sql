-- AlterTable
ALTER TABLE "MiniNews" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "News" ALTER COLUMN "category" DROP NOT NULL;
