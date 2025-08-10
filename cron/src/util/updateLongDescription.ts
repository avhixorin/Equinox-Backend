import { Readability } from "@mozilla/readability";
import axios from "axios";
import { JSDOM } from "jsdom";
import { PrismaClient } from "@prisma/client";
import { getBias } from "./getBias.js";

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

      const biasResult = await getBias(cleaned.slice(0, 1000));
      console.log("biasResult:", biasResult)

      await client.miniNews.update({
        where: { id: miniNews.id },
        data: {
          center: biasResult.center,
          center_left: biasResult.center_left,
          center_right: biasResult.center_right,
          far_left: biasResult.far_left,
          right: biasResult.right,
        }
      });

      // const maxSafeTokenLimit = 1024;
      // const avgCharsPerToken = 2;
      // const safeCharLimit = maxSafeTokenLimit * avgCharsPerToken;

      // const truncatedContent = cleaned.slice(0, safeCharLimit);


      //       try {
      //         const response = await axios.post("https://news-bias-service-696524841053.us-central1.run.app/predict", {
      //           content: truncatedContent
      //         }, {
      //           headers: {
      //             "Content-Type": "application/json",
      //             "Accept": "application/json"
      //           }
      //         })

      // //         await client.miniNews.update({
      // //           where: { id: miniNews.id },
      // //           data: {
      // //             center: response.data.all_scores.centre,
      // //             center_left: response.data.all_scores.centre_left,
      // //             center_right: response.data.all_scores.centre_right,
      // //             far_left: response.data.all_scores.far_left,
      // //             right: response.data.all_scores.right,

      // //           }
      // //         });

      //         console.log("Bias updated successfully for article:", miniNews.id);
      //       } catch (error) {
      //         console.error("Error occurred while fetching bias:", error);
      //       }

      // await csvWriter.writeRecords([records]);
      // console.log(`CSV file created with ${records.title} records.`);

    } else {
      console.warn(`No article content found at ${miniNews.link}`);
    }
  } catch (err: any) {
    console.warn(`Failed to extract ${miniNews.link}: ${err.message}`);
  }
}

// export const updateBiasInAllExistingNews = async () => {
//   const allNews = await client.miniNews.findMany({});
//   let flag = false;
//   for (const news of allNews) {
//     if(news.links[0] === "https://www.ndtv.com/mumbai-news/734-transactions-21-months-4-women-mumbai-man-loses-rs-9-crore-to-cyber-fraud-9044564#publisher=newsstand"){
//       flag = true;
//     }
//     if(!flag){
//       console.log("Skipping bias update for news: ", news.title);
//       continue;
//     }
//     await getNewsFullArticleAndSetBias({ id: news.id, link: news.links[0] });
//     console.log("bias added for news: ", news.title);
//   }
// }

// updateBiasInAllExistingNews()


// getNewsFullArticleAndSetBias({ id: "kkj9", link: "https://www.thehindu.com/news/national/india-welcomes-meeting-between-us-and-russia-in-alaska-on-august-15/article69914098.ece" })