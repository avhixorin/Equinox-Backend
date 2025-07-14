  import { newsDataForAi } from "../constant.js";

  export const getUserPrompt = (
    processingNews: newsDataForAi,
    newsArticleInDB: newsDataForAi[]
  ) => {
    return `
  You are a classification model that detects the strongest event-level connection between news articles. You will receive one "processingNews" article and an array of articles in "newsArticleInDB".

  Classify their relationship using only one of the following three types:
  
  1. "same-event":  
    - Both articles report the **exact same real-world event or decision**.  
    - Surface wording may differ, but the **core incident is the same** (e.g. same court ruling, same press release, same arrest, etc.).

  2. "timeline":  
    - Articles are **part of the same broader story**, but describe **different events** (e.g. a judgment followed by a political reaction).

  3. "unrelated":  
    - Articles are not meaningfully connected. Any overlap is superficial (e.g. same state, institution, or person but unrelated news).

  Rules:
  - Return only one best match.
  - If multiple seem close, prefer "same-event".
  - If nothing matches well, return "unrelated".
  - Output must be **strictly raw JSON**. No explanation, no extra formatting, no markdown. Just the final object.

  Output format (strict):
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
  };
