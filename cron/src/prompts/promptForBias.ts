export function getPromptForBias(newsArticle: string) {
  return `
You are a political bias classification system.
Analyze the given news article and output ONLY a valid JSON object in this exact format:

{
  "center": 0.xx,
  "center_left": 0.xx,
  "center_right": 0.xx,
  "far_left": 0.xx,
  "right": 0.xx
}

Rules:
- Values must be decimal numbers between 0 and 1.
- The sum of all values must be approximately 1 (±0.01 tolerance).
- No explanations, no extra text, no markdown, no code block formatting, only the JSON object.

News Article:
"""${newsArticle}"""
`;
}
