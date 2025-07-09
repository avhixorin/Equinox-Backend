import { newsDataForAi } from "../constant.js";

export const getUserPrompt = (processingNews: newsDataForAi, newsArticleInDB: newsDataForAi[]) => {
    return `
You are given a "processingNews" article and an array of previously stored articles called "newsArticleInDB".

Your job is to compare the "processingNews" article with each article in "newsArticleInDB" and determine the **single most related article**, if any.

There are three types of relationships you may identify:
1. "same-event"
2. "timeline"
3. "unrelated"

Rules:
- Choose only ONE best match.
- Prefer "same-event" over "timeline".
- If no article matches, return "unrelated".

Output JSON only in this structure:
{
  "matchType": "same-event" | "timeline" | "unrelated",
  "id": "<matching_article_id>" | "none",
  "title": "<matching_article_title>" | ""
}

Input:
{
  "processingNews": ${JSON.stringify(processingNews, null, 2)},
  "newsArticleInDB": ${JSON.stringify(newsArticleInDB, null, 2)}
}
`;
}