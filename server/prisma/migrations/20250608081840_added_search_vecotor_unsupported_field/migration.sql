-- Add a generated column for full-text search
ALTER TABLE "MiniNews"
ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce("title", '') || ' ' || coalesce("content", ''))
) STORED;

-- Create a GIN index on the search_vector column
CREATE INDEX "search_vector_idx"
ON "MiniNews"
USING GIN ("search_vector");
