
import OpenAI from 'openai';
import { categoryNames, newsDataForAi, newsDataForCategory, systemPromptForCategory } from '../constant.js';
import dotenv from 'dotenv';
import { getUserPromptForCategory } from '../prompts/promptForCategory.js';


dotenv.config();

if (!process.env.SHIVAAY_API_KEY) {
    throw new Error("SHIVAAY_API_KEY is missing from environment variables.");
}

const openai = new OpenAI({
    apiKey: process.env.SHIVAAY_API_KEY,
    baseURL: 'https://api.futurixai.com/api/shivaay/v1'
});

export async function getCategory(processingNews: newsDataForCategory): Promise<string> {

    const userPrompt = getUserPromptForCategory(processingNews);
    const completion = await openai.chat.completions.create({
        model: "shivaay",
        messages: [
            {
                role: "user",
                content: userPrompt
            }
        ]
    });

    let raw = completion.choices[0]?.message?.content || "";
    console.log("Raw response from AI:", raw);
    raw = raw.replace(/^```json\s*/i, '') // remove ```json at the start (case-insensitive)
        .replace(/^```\s*/i, '')     // or plain ```
        .replace(/\s*```$/, '');
    const index = Number(raw.trim());
    if (isNaN(index) || index < 0 || index >= categoryNames.length) {
        console.warn("Invalid index, defaulting to 'Others'.");
        return "Others";
    }
    return categoryNames[index] || "Others";

}














