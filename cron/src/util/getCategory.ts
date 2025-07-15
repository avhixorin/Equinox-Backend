import { Groq } from 'groq-sdk';
import { categoryNames, newsDataForCategory } from '../constant.js';
import dotenv from 'dotenv';
import { getUserPromptForCategory } from '../prompts/promptForCategory.js';
import {
    categoryPromptCnt,
    newsInDBCnt,
    procssingNewsCnt,
    relatedArticlesPromptCnt,
} from '../embed.js';

dotenv.config();

if (!process.env.GROQ_API_KEY2) {
    throw new Error('GROQ_API_KEY2 is missing from environment variables.');
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY2,
});

export async function getCategory(processingNews: newsDataForCategory): Promise<string> {
    let userPrompt = getUserPromptForCategory(processingNews)

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0,
            max_tokens: 512,
            top_p: 1,
            stream: false,
        });

        let raw = completion.choices[0]?.message?.content || '';
        console.log('Raw response from AI:', raw);

        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');

        const match = raw.trim().match(/-?\d+/);
        const index = match ? Number(match[0]) : -2;

        if (!Number.isInteger(index)) {
            console.warn("Not an integer. Returning 'Others'");
            return 'Others';
        }

        if (index === -1) {
            return 'Others'; 
        }

        if (index < 0 || index >= categoryNames.length) {
            console.warn("Index out of bounds. Returning 'Others'");
            return 'Others';
        }

        return categoryNames[index];
    } catch (error) {
        console.error('Error during AI processing:', error);
        console.log(`\n[+] Processing articles cnt: ${procssingNewsCnt}`);
        console.log(`\n[+] News in DB cnt: ${newsInDBCnt}`);
        console.log(`\n[+] Related articles prompt cnt: ${relatedArticlesPromptCnt}`);
        console.log(`\n[+] Category prompt cnt: ${categoryPromptCnt}`);
        process.exit(1);
    }
}









