import { categoryNames, newsDataForCategory } from "../constant.js";

export const getUserPromptForCategory = (processingNews: newsDataForCategory) => {
  return `
You are an intelligent and precise news classification model.

You are given:
- A **news article** ("processingNews") containing a **title** and **content**.
- A **list of predefined categories** in "categoryArray".

Your task:
- Carefully read and understand the **main topic** and **overall theme** of the article.
- Choose the **single most relevant category** from the category array.
- Return the **index** (0-based) of the best matching category.

🧠 **Classification Rules**:
- **Do NOT rely on keywords alone.** Focus on the actual **subject matter**.
- Base your decision on **what the article is fundamentally about**, not who is mentioned.
- If an article **mentions a businessperson (e.g., Elon Musk)** but talks about political commentary or crime, it is **not business news**.
- Do NOT classify based on tone or sentiment. Focus only on **factual content**.
- If the article does **not clearly fit** any category, return **-1**.

📌 Examples:
- An article discussing a company's revenue or product launch → **"Business"**
- An article about a businessperson’s **social media post targeting a politician** → **"Politics" or "Crime"**
- An article on **RSS expansion or regional peace** → **"Politics"** or **"Religion"**, not **"Business"**

---

There are ${categoryNames.length} categories.

Return only the **index (number)**, with **no text or explanation**.

---

Input:
{
  "processingNews": ${JSON.stringify(processingNews, null, 2)},
  "categoryArray": ${JSON.stringify(categoryNames)}
}
`;
};
