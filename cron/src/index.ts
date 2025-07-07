import { scrapeWebsitNews } from "./scrape/websiteNewsRss.js"
import { processNewsFromFile } from "./embed.js";
import dotenv from 'dotenv';
import { scrapeYouTubeNews } from "./scrape/youtubeNewsRss.js";
import { scrapeTweets } from "./scrape/twitterNewsRss.js";

dotenv.config()
const init = async () => {

    await scrapeTweets();
    await scrapeWebsitNews()
    await scrapeYouTubeNews()
    await processNewsFromFile("articles.json");
    await processNewsFromFile("yt-articles.json");
    await processNewsFromFile("twitter-articles.json");
}

init().then(() => {
    console.log("Cron job completed successfully.");
}).catch((error) => {
    console.error("Error during cron job execution:", error);
});