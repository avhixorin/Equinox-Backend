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

const groqKeys = process.env?.GROQ_API_KEYS1?.split(',') || [];

if (groqKeys.length === 0) {
    throw new Error('No GROQ_API_KEYS1 provided in environment variables.');
}

let workingKeyIndex = 0;

export async function getCategory(processingNews: newsDataForCategory): Promise<string> {
    let userPrompt = getUserPromptForCategory(processingNews)

    const groq = new Groq({
        apiKey: groqKeys[workingKeyIndex],
    });
    console.log("using key number: " + (workingKeyIndex + 1));
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

        workingKeyIndex = (workingKeyIndex + 1) % groqKeys.length;
        if (workingKeyIndex === 0) {
            console.log('All GROQ API keys exhausted. exiting...');
            process.exit(1);
        }
        console.log("New working key index:", workingKeyIndex);
        return getCategory(processingNews);
    }
}









