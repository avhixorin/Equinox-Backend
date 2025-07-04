import { Readability } from "@mozilla/readability";
import { Parser } from "json2csv"
import axios from "axios";
import { JSDOM } from "jsdom";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export async function extract(news: { id: string; link: string }) {
  try {
    const { data: html } = await axios.get(news.link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsScraperBot/1.0)"
      }
    });

    const originalConsoleError = console.error;
    console.error = () => { };

    const dom = new JSDOM(html, { url: news.link });

    console.error = originalConsoleError;

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article?.textContent) {
      const title = dom.window.document.title || "Untitled";

      const cleaned = article.textContent
        .replace(/(?:twitter\.com|facebook\.com|instagram\.com)[^\s]+/gi, "")
        .replace(/(First Published|Last Updated):.+?\n/gi, "")
        .replace(/\s{2,}/g, " ")

      //write now to store longDescription for model training purpose to make csv from this data.
      console.log("\nUpdating in DB...");
      await client.miniNews.update({
        where: { id: news.id },
        data: {
          longDescription: cleaned,
        },
      });

      //once we have model
      // const record = [{
      //   newsId: news.id,
      //   link: news.link,
      //   title: title,
      //   fullNews: cleaned
      // }];

      // const parser = new Parser({ fields: ['newsId', 'link', 'title', 'fullNews'] });
      // const csvData = parser.parse(record);

      // const response = await axios.post(
      //   'https://your-model-endpoint.com/detect-bias',
      //   csvData,
      //   {
      //     headers: {
      //       'Content-Type': 'text/csv'
      //     }
      //   }
      // );

      // const bias = response.data.bias || 'unknown';

      // await client.miniNews.update({
      //   where: { id: news.id },
      //   data: { bias }
      // });

    } else {
      console.warn(`⚠️ No article content found at ${news.link}`);
    }
  } catch (err: any) {
    console.warn(`❌ Failed to extract ${news.link}: ${err.message}`);
  }
}


// const newsArticle = [
//   "https://www.news18.com/movies/setback-to-jacqueline-fernandez-as-delhi-hc-rejects-her-plea-in-rs-200-crore-money-laundering-case-ws-l-9419017.html",
//   "https://www.news18.com/cities/new-delhi-news/end-of-life-vehicles-will-not-be-impounded-as-delhi-govt-puts-eol-policy-on-hold-amid-backlash-ws-l-9419002.html"
// ];

// (async () => {
//   for (let i = 0; i < newsArticle.length; i++) {
//     const feed = newsArticle[i];
//     await extract({ link: feed, id: `${i}` });
//     console.log(`✅ Processed ${i + 1}/${newsArticle.length}`);
//   }
// })();


