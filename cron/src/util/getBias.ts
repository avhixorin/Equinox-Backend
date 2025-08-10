import { Groq } from 'groq-sdk';

import dotenv from 'dotenv';
import {
    categoryPromptCnt,
    newsInDBCnt,
    procssingNewsCnt,
    relatedArticlesPromptCnt,
} from '../embed.js';

import { getPromptForBias } from '../prompts/promptForBias.js';

dotenv.config();

const groqKeys = process.env?.GROQ_API_KEYS_BIAS?.split(',') || [];

if (groqKeys.length === 0) {
    throw new Error('No GROQ_API_KEYS_BIAS provided in environment variables.');
}

let workingKeyIndex = 0;

export async function getBias(processingNews: string) {
    let userPrompt = getPromptForBias(processingNews);

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

        return JSON.parse(raw)
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
        return getBias(processingNews);
    }
}









