import { indexPromise } from "./util/createVectorDbIndex.js";
import { promises } from 'fs'
import dotenv from 'dotenv';
import { notifyServerOfNewArticles } from "./util/notifyServer.js";
import { getMiniNewsById, handleArticle } from "./timeline/handleArticle.js";
import { Article, DELAY_MS, MatchType, newsDataForAi, ResultJson, SIMILARITY_THRESHOLD, } from "./constant.js";
import { getBestMatch } from "./timeline/getRelatedArticles.js";
import { getCategory } from "./util/getCategory.js";

dotenv.config()

const BACKEND_URL = process.env.BACKEND_GRAPHQL_URL;
const mode = process.env.MODE || "development";

if (!BACKEND_URL) {
  console.log("Missing required environment variables: BACKEND_GRAPHQL_URL");
  process.exit(1);
}


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
    console.log(`--Searching for similar articles in vector DB with query: ${queryText}`);
    const topNewsResults = await index.searchRecords({
      query: { topK: 10, inputs: { text: queryText } },
    });

    topNewsResults.result.hits[0]._score

    const topNewsId = [];;
    for (const hit of topNewsResults.result.hits) {
      if (hit._score > SIMILARITY_THRESHOLD) {
        topNewsId.push(hit._id);
      }
    }
    const topNewsChunks: newsDataForAi[] = []
    for (const id of topNewsId) {
      const miniNews = await getMiniNewsById(id);
      if (miniNews) {
        topNewsChunks.push({
          id: miniNews.id,
          title: miniNews.title,
          content: miniNews.content ?? "",
          pubDate: miniNews.pubDate.toISOString()
        });
      }

    }


    await sleep(DELAY_MS);

    console.log(`--Found ${topNewsChunks.length} similar articles in vector DB.`);
    if (topNewsChunks.length === 0) {
      matchType = MatchType.UNRELATED;
      console.log("--No similar news found for this article in vector DB, treating as new article.");
    }
    else {

      const resultJson: ResultJson = await getBestMatch({
        processingNews: {
          title: article.title,
          content: article.content || "",
          pubDate: article.pubDate.toISOString(),
          id: article.link

        }, newsArticleInDB: topNewsChunks
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
    console.log(`---Error during article matching: ${error}`);
    return;
  }

  if (!matchType) {
    console.log(`---Unknown match type/invalid related id skipping article processing.`);
    return;
  }

  if (matchType === MatchType.UNRELATED && (article.youtube || article.twitter)) {
    console.log("--Skipping this unrelated youtube/twitter news")
    return;
  }


  const category = await getCategory({ title: article.title, content: article.content || "" })
  console.log(`MatchType: ${matchType}\nCategory: ${category}`);
  const miniNewsId = await handleArticle(article, category, matchType, relatedId)

  if (!miniNewsId) {
    console.log(`---Skipping processing of article due to error in storing it in DB.`);
    return;
  }

  await index.upsertRecords([{
    id: miniNewsId,
    chunk_text: queryText,
  }]);

  await sleep(DELAY_MS);

  // await index.update({
  //   id: miniNewsId,
  //   metadata: {}
  // }); // it didn't worked

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
          await sleep(DELAY_MS);
          await processArticle(article);
        } else {
          console.log(`---Skipping processing of article due to missing required fields.`);
        }
      } catch (error) {
        console.log(`Error processing article ${article.title}: ${article.link}`, error);

      }
    }
    await notifyServerOfNewArticles(BACKEND_URL);

  } catch (error) {
    console.log(`Error reading file ${articlePath}:`, error);
  }
};


