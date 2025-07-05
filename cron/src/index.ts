import {fetchFnc} from "./scrape/fetch_rss.js"
import { mainInit, mainInitForYt } from "./embed.js";
import dotenv from 'dotenv';
import { fetchYouTubeArticles } from "./scrape/youtube_rss_parse.js";

dotenv.config()

const init = async () => {
    console.log("cron job stopped");
    //  await fetchFnc();
    //  await fetchYouTubeArticles();
    //  await mainInit();
    //  await mainInitForYt();
}

init().then(() => {
    console.log("Cron job completed successfully.");
}).catch((error) => {
    console.error("Error during cron job execution:", error);
});