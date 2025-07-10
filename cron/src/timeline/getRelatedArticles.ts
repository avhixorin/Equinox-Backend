import OpenAI from 'openai';
import { MatchType, newsDataForAi, ResultJson, systemPrompt } from '../constant.js';
import dotenv from 'dotenv';
import { getUserPrompt } from '../prompts/promptForTimeline.js';

dotenv.config();

if (!process.env.SHIVAAY_API_KEY) {
    throw new Error("SHIVAAY_API_KEY is missing from environment variables.");
}

const openai = new OpenAI({
    apiKey: process.env.SHIVAAY_API_KEY,
    baseURL: 'https://api.futurixai.com/api/shivaay/v1'
});
export async function getBestMatch({
    processingNews,
    newsArticleInDB
}: {
    processingNews: newsDataForAi;
    newsArticleInDB: newsDataForAi[];
}): Promise<ResultJson> {
    const returnData: ResultJson = {
        matchType: MatchType.UNRELATED,
        id: 'none'
    };

    if (newsArticleInDB.length === 0) return returnData;

    const userPrompt = getUserPrompt(processingNews, newsArticleInDB);
    const completion = await openai.chat.completions.create({
        model: "shivaay",
        messages: [
            {
                role: "user",
                content: userPrompt
            }
        ],

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
}





// import { Groq } from 'groq-sdk';
// import dotenv from 'dotenv';


// dotenv.config();

// if (!process.env.GROQ_API_KEY) {
//     throw new Error("GROQ_API_KEY is missing from environment variables.");
// }

// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY,
// });

// export async function getBestMatch({ processingNews, newsArticleInDB }: {
//     processingNews: { id: string; title: string; content: string; pubDate: string };
//     newsArticleInDB: { id: string; title: string; content: string; pubDate: string }[];
// }): Promise<{
//     matchType: 'same-event' | 'timeline' | 'unrelated';
//     id: string;
//     title: string;
// }> {
//     if (!processingNews || !newsArticleInDB || newsArticleInDB.length === 0) {
//         return {
//             matchType: 'unrelated',
//             id: '-1',
//             title: ''
//         };
//     }
//     const userPrompt = `
// You are given a \"processingNews\" article and an array of previously stored articles called \"newsArticleInDB\".

// Your job is to compare the \"processingNews\" article with each article in \"newsArticleInDB\" and determine the **single most related article**, if any.

// There are three types of relationships you may identify:

// 1. \"same-event\": The articles are about the exact same real-world event or announcement, even if the wording is different or sources vary. These are duplicates in substance.

// 2. \"timeline\": The article is clearly part of the same ongoing story — a cause, consequence, background, follow-up, or reaction. They are not duplicates, but form a narrative chain.

// 3. \"unrelated\": The article has no strong connection to any real-world event or story referenced in the processingNews article.

// ---

// 🧠 Rules:
// - Only consider **event-based, factual connections**.
// - Choose the **single most relevant match**, based on depth of connection and proximity in story.
// - If two options qualify, prefer \"same-event\" over \"timeline\".
// - evacuation, protests, sanctions, political statements, or military action in response to the same event chain should be treated as \"timeline\"
// - Consider pubDate: If one article follows shortly after another and discusses its outcome, classify as \"timeline\".
// - Articles with the same pubDate and overlapping core content are likely \"same-event\".

// ---

// 📤 Output Format:
// Return **only JSON** with this exact structure:

// If a related article is found:
// {
//   "matchType": "same-event" | "timeline",
//   "id": "<matching_article_id>",
//   "title": "<matching_article_title>"
// }

// If no related article is found:
// {
//   "matchType": "unrelated",
//   "id": -1,
//   "title": ""
// }

// ---

// Do not return code, markdown, explanations, thoughts, or steps. Only valid JSON as shown above.

// Input:
// {
//   "processingNews": ${JSON.stringify(processingNews, null, 2)},
//   "newsArticleInDB": ${JSON.stringify(newsArticleInDB, null, 2)}
// }
// `;

//     const chatCompletion = await groq.chat.completions.create({
//         messages: [
//             {
//                 role: 'system',
//                 content: `You are a highly capable news intelligence model. Your job is to identify and group semantically and contextually related news articles based on real-world event similarity. You must reason about the narrative, timeline, cause-effect, and topic continuity. Only return your final answer as raw JSON.`
//             },
//             {
//                 role: 'user',
//                 content: userPrompt
//             }
//         ],
//         model: 'meta-llama/llama-4-scout-17b-16e-instruct',
//         temperature: 0,
//         max_tokens: 2048,
//         top_p: 1,
//         stream: false
//     });

//     return JSON.parse(
//         chatCompletion.choices[0].message.content ||
//         '{"matchType":"unrelated","id":"-1","title":""}'
//     );
// }
