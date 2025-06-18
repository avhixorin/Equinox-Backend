ALTER TABLE "MiniNews"
ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce("title", '') || ' ' || coalesce("content", ''))
) STORED;
CREATE INDEX "search_vector_idx"
ON "MiniNews"
USING GIN ("search_vector");
