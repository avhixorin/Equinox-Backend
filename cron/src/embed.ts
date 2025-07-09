import { indexPromise } from "./util/createVectorDbIndex.js";
import { CohereClient } from "cohere-ai";
import { promises } from 'fs'
import dotenv from 'dotenv';
import { notifyServerOfNewArticles } from "./util/notifyServer.js";
import { handleArticle } from "./timeline/handleArticle.js";
import { Article, DELAY_MS, MatchType, ResultJson, } from "./constant.js";
import { getBestMatch } from "./timeline/getRelatedArticles.js";
import { getCategory } from "./util/getCategory.js";

dotenv.config()

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const BACKEND_URL = process.env.BACKEND_GRAPHQL_URL;
const mode = process.env.MODE || "development";

if (!BACKEND_URL) {
  console.error("Missing required environment variables: BACKEND_GRAPHQL_URL");
  process.exit(1);
}

if (!COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is missing from environment variables.");
}

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});


const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processArticle = async (article: Article) => {
  console.log(`\n[+] Processing article: ${article.title}`);
  let matchType: MatchType | null = null;
  let relatedId = ""
  let queryText = `${article.title}`;
  const index = await indexPromise

  if (article.content)
    queryText += `${article.content}`;

  try {
    const topNewsResults = await index.searchRecords({
      query: { topK: 10, inputs: { text: queryText } },
    });

    const topNewsChunks = topNewsResults.result.hits.map(
      hit => (hit.fields as { chunk_text?: string })?.chunk_text || ""
    );
    const topNewsLinks = topNewsResults.result.hits.map(hit => hit._id);

    await sleep(DELAY_MS);
    if (topNewsChunks.length === 0) {
      matchType = MatchType.UNRELATED;
      console.warn("--No similar news found for this article in vector DB, treating as new article.");
    }
    else {

      const resultJson: ResultJson = await getBestMatch({
        processingNews: {
          title: article.title,
          content: article.content || "",
          pubDate: article.pubDate.toISOString(),
          id: article.link

        }, newsArticleInDB: topNewsChunks.map((chunk, index) => ({
          id: topNewsLinks[index],
          title: chunk,
          content: "",
          pubDate: ""
        }))
      });

      console.log("Best match result:", resultJson);
      switch (resultJson.matchType) {
        case MatchType.UNRELATED:
          matchType = MatchType.UNRELATED;
          break;
        case MatchType.TIMELINE:
          matchType = MatchType.TIMELINE;
          break;
        case MatchType.SAME_EVENT:
          matchType = MatchType.SAME_EVENT;
          break;
      }
      relatedId = resultJson.id;
    }

  }
  catch (error) {
    console.error(`---Error during article matching: ${error}`);
    return;
  }

  if (!matchType) {
    console.warn(`---Unknown match type/invalid related id skipping article processing.`);
    return;
  }

  if (matchType === MatchType.UNRELATED && (article.youtube || article.twitter)) {
    console.log("--Skipping this unrelated youtube/twitter news")
    return;
  }

  //figure out category
  const category = await getCategory({ title: article.title, content: article.content || "" })
  console.log(`MatchType: ${matchType}\nCategory: ${category}`);
  const miniNewsId = await handleArticle(article, category , MatchType.UNRELATED, relatedId)

  if (!miniNewsId) {
    console.warn(`---Skipping processing of article due to error in storing it in DB.`);
    return;
  }

  await index.upsertRecords([{
    id: miniNewsId,
    chunk_text: queryText,
  }]);

  await sleep(DELAY_MS);

  await index.update({
    id: miniNewsId,
    metadata: {}
  });

  console.log(`Processed: ${article.title} ${article.link}`);
}

export const processNewsFromFile = async (jsonName: string) => {
  const articlePath = mode === "development" ? `./${jsonName}` : `./cron/${jsonName}`;
  try {
    const data = await promises.readFile(articlePath, 'utf8')
    const articles: Article[] = JSON.parse(data);
    console.log('Articles loaded successfully:', articles.length);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const pubDateinDateType = new Date(article.pubDate);
      article.pubDate = pubDateinDateType;

      let canWeProcessArticle = false;
      switch (jsonName) {
        case "articles.json":
          canWeProcessArticle = article.link && article.title && article.source && article.content && article.imageUrl ? true : false
          break;

        case "yt-articles.json":
          canWeProcessArticle = article.link && article.title && article.source && article.content && article.imageUrl ? true : false
          break;

        case "twitter-articles.json":
          canWeProcessArticle = article.link && article.title && article.source ? true : false
          break;

      }
      try {
        if (canWeProcessArticle) {
          await processArticle(article);
        } else {
          console.warn(`---Skipping processing of article due to missing required fields.`);
        }
      } catch (error) {
        console.error(`Error processing article ${article.title}: ${article.link}`, error);

      }

      await sleep(DELAY_MS);
    }

    await notifyServerOfNewArticles(BACKEND_URL);

  } catch (error) {
    console.error(`Error reading file ${articlePath}:`, error);
  }
};


