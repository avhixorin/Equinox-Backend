import {fetchFnc} from "./fetch_rss.js"
import { mainInit } from "./embed.js";
import dotenv from 'dotenv';

dotenv.config()

const init = async () => {
     (await fetchFnc());
     await mainInit();
}

init().then(() => {
    console.log("Cron job completed successfully.");
}).catch((error) => {
    console.error("Error during cron job execution:", error);
});