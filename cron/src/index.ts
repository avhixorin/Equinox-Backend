import {fetchFnc} from "./fetch_rss.js"
import { mainInit, mainInitForYt } from "./embed.js";
import dotenv from 'dotenv';
import { fetchYouTubeArticles } from "./youtube_rss_parse.js";

dotenv.config()

const init = async () => {
     await fetchFnc();
     await fetchYouTubeArticles();
     await mainInit();
     await mainInitForYt();
}

init().then(() => {
    console.log("Cron job completed successfully.");
}).catch((error) => {
    console.error("Error during cron job execution:", error);
});