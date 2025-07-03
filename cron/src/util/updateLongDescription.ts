import { Readability } from "@mozilla/readability";
import { PrismaClient } from "@prisma/client";

import axios from "axios";
import { JSDOM } from "jsdom";

const client = new PrismaClient()

export async function extract(news: { id: string, link: string }) {
    const { data: html } = await axios.get(news.link)
    const dom = new JSDOM(html, { url: news.link });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    console.log(`article title: ${article?.title?.trim()}\n\narticle content: ${article?.textContent?.trim()}`);
    if (article?.textContent) {
        console.log("\nupdating in db!")
        await client.miniNews.update({
            where: { id: news.id },
            data: {
                longDescription: article.textContent.trim()
            }

        })
    }
}

// export const scrapeWebsites = async () => {
//     const miniNews = await client.miniNews.findMany({
//         select: {
//             id: true,
//             link: true
//         }
//     })

//     for (let news of miniNews) {
//         try {
//             await extract(news)
//         } catch (error) {
//             console.error(`Error extracting ${news.link}:`, error);
//         }
//         console.log("------------------------------------------------------------------------------------------------");
//     }
// }
