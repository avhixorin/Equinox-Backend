
import { Groq } from 'groq-sdk';
import { categoryNames, newsDataForCategory } from '../constant.js';
import dotenv from 'dotenv';
import { getUserPromptForCategory } from '../prompts/promptForCategory.js';
import { categoryPromptCnt, newsInDBCnt, procssingNewsCnt, relatedArticlesPromptCnt } from '../embed.js';


dotenv.config();


if (!process.env.GROQ_API_KEY2) {
    throw new Error("GROQ_API_KEY2 is missing from environment variables.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY2,
});

export async function getCategory(processingNews: newsDataForCategory): Promise<string> {

    const userPrompt = getUserPromptForCategory(processingNews);
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0,
            max_tokens: 2048,
            top_p: 1,
            stream: false
        });


        let raw = completion.choices[0]?.message?.content || "";
        console.log("Raw response from AI:", raw);
        raw = raw.replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/, '');
        const index = Number(raw.trim());
        if (isNaN(index) || index < 0 || index >= categoryNames.length) {
            console.warn("Invalid index, defaulting to 'Others'.");
            return "Others";
        }
        return categoryNames[index] || "Others";
    } catch (error) {
        console.log("Error during AI processing:", error);
        console.log("Error during AI processing:", error);
        console.log(`\n[+] procesing articles cnt ${procssingNewsCnt} `);
        console.log(`\n[+] news in DB cnt ${newsInDBCnt} `);
        console.log(`\n[+] related articles prompt cnt ${relatedArticlesPromptCnt} `);
        console.log(`\n[+] category prompt cnt ${categoryPromptCnt} `);
        process.exit(1);
      ;
    }


}














