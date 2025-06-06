import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "MiniNews"
    ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
      to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) STORED;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX search_vector_idx
    ON "MiniNews"
    USING GIN (search_vector);
  `);

  console.log("Full-text search setup done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
