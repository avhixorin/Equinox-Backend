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
- Return the **index** (number) of the best matching category.

📏 **Important Indexing Rule (READ CAREFULLY)**:
- The index must be **0-based**.
- That means: the **first category has index 0**, the second has index 1, and so on.
- **DO NOT return 1-based index** under any condition. **Index 0 is a valid answer**.
- If none of the categories are a good fit, return **-1**.

🧠 **Classification Rules**:
- Do **NOT rely on keywords alone** — focus on the actual **subject matter** and **what the article is fundamentally about**.
- Do NOT classify based on **tone or sentiment**.
- If the article mentions a person (e.g., Elon Musk), **do not assume** it's "Business" unless the core topic is actually business-related.
- Examples:
  - Article about a company's earnings → **"Business"**
  - Article about a businessperson's political rant → **"Politics"** or **"Crime"**
  - Article about RSS, Ram Mandir, or religious conflict → likely **"Religion"** or **"Politics"**

🧪 **Indexing Example**:
If the category list is:
["Business", "Politics", "Crime", "Religion", "Sports"]

Then:
- If the best category is "Business", return → **0**
- If "Religion", return → **3**
- If none match, return → **-1**

---

There are ${categoryNames.length} categories in total.

Return only the **index number** (no text, no explanation, no label).

---

Input:
{
  "processingNews": ${JSON.stringify(processingNews, null, 2)},
  "categoryArray": ${JSON.stringify(categoryNames)}
}
`;
};
