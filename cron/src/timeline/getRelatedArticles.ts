// const jsona = {
//     "id": "ec05a91e-fd2c-4233-99bb-abf9c4b51f83",
//     "title": "\"All Planes Will Head Home\": Trump, Unhappy With Israel, Dials Netanyahu",
//     "content": "The ceasefire between Iran and Israel \"is in effect\" and Israel is not going to attack Iran, Donald Trump declared on Tuesday amid fears that the tenous ceasefire agreement between Iran and Israel will not hold.",
//     "pubDate": "1750769437000"
// }

// const processingNews = {
//     id: jsona.id,
//     title: jsona.title,
//     content: jsona.content,
//     pubDate: jsona.pubDate
// };


// const jsonb = [

//     {
//         "id": "debed6df-d3a5-45ad-bc8c-e311a513420b",
//         "title": "Did Israel strikes trigger earthquake in Tehran? Tremors could be linked to Iran nukes",
//         "content": "An earthquake of magnitude 5.1 hit northern Iran. This event occurred amidst ongoing Israeli airstrikes. Some analysts speculate a possible link to Iran's nuclear program. Semnan province, near the epicenter, houses key nuclear and missile infrastructure. Iran denies pursuing nuclear weapons. The incident has heightened tensions in West Asia. Investigations are underway to determine the cause of the tremor.",
//         "pubDate": "1750503846000"
//     },
//     {
//         "id": "fac29543-1b1f-4898-9ded-4973d907d6f5",
//         "title": "Israel-Iran Attacks LIVE: Tehran's Internal Security Headquarters Destroyed, Claims Israel",
//         "content": "Israel-Iran Conflict Day 6 LIVE Updates: The deadly conflict between Iran and Israel entered its sixth day on Wednesday, with both sides widening their attacks.",
//         "pubDate": "1750255235000"
//     },
//     {
//         "id": "84789a89-d89d-4a58-849f-751b8ad1dae7",
//         "title": "Khamenei Says US \"Gained Nothing\" From Attacks On Iran",
//         "content": "Iran will never surrender to the US and any future aggression would come at a great cost, its supreme leader, Ayatollah Ali Khamenei, said today in his first remarks after the ceasefire between Iran and Israel",
//         "pubDate": "1750938693000"
//     },

//     {
//         "id": "ea5bc045-c9fd-43b6-80eb-177f1363f47e",
//         "title": "'Islamic Republic has reached its end': Exiled royal urges uprising in Iran",
//         "content": "Reza Pahlavi, the exiled Iranian prince, has passionately called upon Iran's military, police, and state employees to join a nationwide uprising against the current Islamic Republic, asserting that its collapse is imminent. His appeal follows Israeli Prime Minister Benjamin Netanyahu's strong endorsement of regime change in Iran, highlighting widespread dissent and suggesting the regime's days are numbered.",
//         "pubDate": "1750237302000"
//     },
//     {
//         "id": "2cc259ed-e912-47f6-bce6-2df9c8bc1b0c",
//         "title": "Iran ‘will never surrender’: Khamenei warns US of 'irreparable damage' if it intervenes",
//         "content": "Amid escalating Middle East tensions, Iran's Ayatollah Khamenei warned the US against intervention in the ongoing conflict with Israel, threatening “irreparable damage.” This follows a fierce aerial war and inflammatory remarks by US President Trump. Iran claimed to have launched hypersonic missiles at Israel, marking a regional first.",
//         "pubDate": "1750245346000"
//     },
//     {
//         "id": "64daa000-9669-46a5-9b68-7d2ccb510d67",
//         "title": "War, power, and Les Misérables: 10 facts about Iran's Khamenei",
//         "content": "Ayatollah Ali Khamenei, Iran's Supreme Leader, faces escalating challenges amid Israeli strikes and regional instability. Despite his reclusive nature, Khamenei wields immense power over Iran's military, nuclear program, and foreign policy. He has built a network of regional proxies while suppressing domestic dissent, all while maintaining a surprising appreciation for literature.",
//         "pubDate": "1750407932000"
//     },
//     {
//         "id": "bae6ce23-1cf0-4178-a98b-8c31d3b0acd9",
//         "title": "Israel-Iran War LIVE Updates: \"All Planes Will Head Home\": Trump, Unhappy With Israel, Dials Netanyahu",
//         "content": "US-Israel-Iran Conflict LIVE Updates: A series of powerful explosions rocked Tehran early Tuesday morning, hours after US President Donald Trump announced that Iran and Israel have agreed to a staggered ceasefire.",
//         "pubDate": "1750768688000"
//     },

// ]

// const newsArticleInDB = jsonb.map(article => ({
//     id: article.id,
//     title: article.title,
//     content: article.content,
//     pubDate: article.pubDate
// }));


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
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ]
    });

    const raw = completion.choices[0]?.message?.content || "";
    console.log("Raw response from AI:", raw);

    try {
        const parsed: ResultJson = JSON.parse(raw);

        if (
            !Object.values(MatchType).includes(parsed.matchType) ||
            typeof parsed.id !== 'string'
        ) {
            return returnData;
        }

        return parsed;
    } catch (err) {
        console.error("JSON parse error:", err);
        return returnData;
    }
}




// const json = await getBestMatch({ processingNews, newsArticleInDB })
// console.log("Best match result:", json);














// utils/getBestMatch.js
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
