import { categoryNames, newsDataForCategory } from "../constant.js";

export const getUserPromptForCategory = (processingNews: newsDataForCategory) => {
    return `
You are an intelligent news classification model.

You are given a "processingNews" article, which includes a title and content. You are also given a list of predefined categories.

Your task is to:
- Carefully analyze the article.
- Select the **single most relevant category** based on the article's **main topic or theme**.
- Return the **index** of the best matching category from the provided array.

🧠 Guidelines:
- Do not guess. Only choose a category if it clearly fits.
- If the article **does not belong** to any of the categories, return **-1**.
- Focus on **factual alignment**, not just keyword overlap.
- Consider the **overall subject**, not just one line.

There are ${categoryNames.length} categories.

Return only the index (number), without explanation, JSON, or text.

---

Input:
{
  "processingNews": ${JSON.stringify(processingNews, null, 2)},
  "categoryArray": ${JSON.stringify(categoryNames)}
}
`;
};
