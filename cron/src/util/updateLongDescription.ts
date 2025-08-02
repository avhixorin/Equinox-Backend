import { Readability } from "@mozilla/readability";
import { createObjectCsvWriter } from "csv-writer"
import axios from "axios";
import { JSDOM } from "jsdom";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

// const csvWriter = createObjectCsvWriter({
//   path: './newsData.csv',
//   header: [
//     { id: 'title', title: 'Title' },
//     { id: 'content', title: 'Content' }
//   ],
//   alwaysQuote: true,
// });

export async function getNewsFullArticleAndSetBias(miniNews: { id: string; link: string }) {
  try {
    const { data: html } = await axios.get(miniNews.link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
      }
    });

    const originalConsoleError = console.error;
    console.error = () => { };

    const dom = new JSDOM(html, { url: miniNews.link });

    console.error = originalConsoleError;

    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (article?.textContent) {

      const cleaned = article.textContent
        .replace(/(?:twitter\.com|facebook\.com|instagram\.com)[^\s]+/gi, "")
        .replace(/(First Published|Last Updated):.+?\n/gi, "")
        .replace(/\s{2,}/g, " ")

      const maxSafeTokenLimit = 1024;
      const avgCharsPerToken = 2;
      const safeCharLimit = maxSafeTokenLimit * avgCharsPerToken; 

      const truncatedContent = cleaned.slice(0, safeCharLimit);


      try {
        const response = await axios.post("https://news-bias-service-696524841053.us-central1.run.app/predict", {
          content: truncatedContent
        }, {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        })

        await client.miniNews.update({
          where: { id: miniNews.id },
          data: {
            center: response.data.center,
            center_left: response.data.center_left,
            center_right: response.data.center_right,
            far_left: response.data.far_left,
            right: response.data.right,
            confidence: response.data.confidence,
            contextsummary: response.data.context_summary,
            predictedbias: response.data.predicted_bias
          }
        });

        console.log("Bias updated successfully for article:", miniNews.id);
      } catch (error) {
        console.error("Error occurred while fetching bias:", error);
      }

      // await csvWriter.writeRecords([records]);
      // console.log(`CSV file created with ${records.title} records.`);

    } else {
      console.warn(`No article content found at ${miniNews.link}`);
    }
  } catch (err: any) {
    console.warn(`Failed to extract ${miniNews.link}: ${err.message}`);
  }
}
