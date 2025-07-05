import { Readability } from "@mozilla/readability";
import { Parser } from "json2csv"
import { createObjectCsvWriter } from "csv-writer"
import axios from "axios";
import { JSDOM } from "jsdom";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const csvWriter = createObjectCsvWriter({
  path: './newsData.csv',
  header: [
    { id: 'title', title: 'Title' },
    { id: 'content', title: 'Content' }
  ],
  alwaysQuote: true,
});

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
      
      const cleaned = article.textContent
        .replace(/(?:twitter\.com|facebook\.com|instagram\.com)[^\s]+/gi, "")
        .replace(/(First Published|Last Updated):.+?\n/gi, "")
        .replace(/\s{2,}/g, " ")

      await client.miniNews.update({
        where: { id: news.id },
        data: {
          longDescription: cleaned,
        }
      });

      // await csvWriter.writeRecords([records]);
      // console.log(`✅ CSV file created with ${records.title} records.`);

    } else {
      console.warn(`⚠️ No article content found at ${news.link}`);
    }
  } catch (err: any) {
    console.warn(`❌ Failed to extract ${news.link}: ${err.message}`);
  }
}


import fs from "fs";
import csv from "csv-parser";

export function extractLinksFromCsv(csvPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const links: string[] = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row: Record<string, string>) => {
        if (row.link) {
          links.push(row.link);
        }
      })
      .on("end", () => {
        console.log(`✅ Extracted ${links.length} links.`);
        resolve(links);
      })
      .on("error", (err: Error) => {
        console.error("❌ Error reading CSV:", err.message);
        reject(err);
      });
  });
}


// (async () => {
//   const newsArticle = await extractLinksFromCsv("yourfile.csv");
//   for (let i = 0; i < newsArticle.length; i++) {
//     const feed = newsArticle[i];
//     await extract({ link: feed, id: `${i}` });
//     console.log(`✅ Processed ${i + 1}/${newsArticle.length}`);
//   }
// })();


