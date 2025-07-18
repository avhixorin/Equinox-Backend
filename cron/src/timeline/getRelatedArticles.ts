import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
import { MatchType, ResultJson } from '../constant.js';
import { categoryPromptCnt, newsInDBCnt, procssingNewsCnt, relatedArticlesPromptCnt } from '../embed.js';
import { getUserPrompt } from '../prompts/promptForTimeline.js';

dotenv.config();

const groq_keys = process.env?.GROQ_API_KEYS1?.split(',') || []

if (groq_keys.length === 0) {
    throw new Error("No GROQ_API_KEYS1 provided in environment variables.");
}

let workingKeyIndex = 0

export async function getBestMatch({ processingNews, newsArticleInDB }: {
    processingNews: { id: string; title: string; content: string; pubDate: string };
    newsArticleInDB: { id: string; title: string; content: string; pubDate: string }[];
}): Promise<ResultJson> {

    const returnData: ResultJson = {
        matchType: MatchType.UNRELATED,
        id: 'none'
    };

    if (!processingNews || !newsArticleInDB || newsArticleInDB.length === 0) {
        return returnData;
    }
    const userPrompt = getUserPrompt(processingNews, newsArticleInDB);
    console.log("using key number: " + (workingKeyIndex + 1));
    const groq = new Groq({
        apiKey: groq_keys[workingKeyIndex],
    });

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a highly capable news intelligence model. Your job is to identify and group semantically and contextually related news articles based on real-world event similarity. You must reason about the narrative, timeline, cause-effect, and topic continuity. Only return your final answer as raw JSON.`
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0,
            max_tokens: 2048,
            top_p: 1,
            stream: false
        });

        console.log(completion.choices[0]?.message)
        const raw = completion.choices[0]?.message?.content || "";
        console.log("Raw response from AI:", raw);
        const cleaned = raw
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/, '');
        try {
            const parsed: ResultJson = JSON.parse(cleaned);
            if (
                !Object.values(MatchType).includes(parsed.matchType) ||
                typeof parsed.id !== 'string'
            ) {
                return returnData;
            }
            return parsed;
        } catch (err) {
            console.log("JSON parse error:", err);
            return returnData;
        }

    } catch (error) {
        console.log("Error during AI processing:", error);
        console.log("Error during AI processing:", error);
        console.log(`\n[+] procesing articles cnt ${procssingNewsCnt} `);
        console.log(`\n[+] news in DB cnt ${newsInDBCnt} `);
        console.log(`\n[+] related articles prompt cnt ${relatedArticlesPromptCnt} `);
        console.log(`\n[+] category prompt cnt ${categoryPromptCnt} `);
        workingKeyIndex = (workingKeyIndex + 1) % groq_keys.length;
        if (workingKeyIndex === 0) {
            console.log("All GROQ API keys have been tried. No working key found.");
            process.exit(1);
        }
        console.log(`\n[+] Switching to next GROQ API key number: ` + (workingKeyIndex + 1));
        return getBestMatch({ processingNews, newsArticleInDB });

    }
}




