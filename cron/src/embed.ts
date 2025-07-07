import { index } from "./util/createVectorDbIndex.js";
import { CohereClient } from "cohere-ai";
import { readFile } from 'fs'
import dotenv from 'dotenv';
import { notifyServerOfNewArticles } from "./util/notifyServer.js";
import { handleNewArticle, handleRelatedArticle } from "./util/handleArticle.js";
import { Article, CATEGORY_THRESHOLD, categoryDocs, categoryNames, COHERE_DELAY_MS, SIMILARITY_THRESHOLD } from "./constant.js";

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
  console.log(`\n\n[+] Processing article: ${article.title}`);

  try {
    let queryText = `${article.title}`;
    if (article.content)
      queryText += `${article.content}`;

    const topNewsResults = await (await index).searchRecords({
      query: { topK: 10, inputs: { text: queryText } },
    });

    const topNewsChunks = topNewsResults.result.hits.map(
      hit => (hit.fields as { chunk_text?: string })?.chunk_text || ""
    );
    const topNewsLinks = topNewsResults.result.hits.map(hit => hit._id);

    await sleep(COHERE_DELAY_MS);
    let isNew = true, relatedScore = 0, relatedLink = "";
    if (topNewsChunks.length === 0) {
      console.warn("No similar news found for this article.");
    }
    else {
      const rerankRelated = await cohere.rerank({
        query: queryText,
        documents: topNewsChunks,
        model: 'rerank-multilingual-v3.0',
        topN: 1
      });

      relatedScore = rerankRelated.results[0]?.relevanceScore || 0;
      isNew = relatedScore < SIMILARITY_THRESHOLD;
      const relatedIndex = rerankRelated.results[0]?.index ?? 0;
      relatedLink = topNewsLinks[relatedIndex];
    }

    if (isNew && article.youtube || isNew && article.twitter) {
      console.log("skipping this youtube videos since it is not related to any website news feeds!")
      return;
    }

    console.log(`isNew: ${isNew}, score: ${relatedScore}, link: ${relatedLink}`);

    await sleep(COHERE_DELAY_MS);
    const rerankCategory = await cohere.rerank({
      query: queryText,
      documents: categoryDocs,
      topN: 1
    });

    const categories = [];

    for (let i = 0; i < rerankCategory.results.length; i++) {
      const categoryDrv = rerankCategory.results[i]?.index
      let categoryDerived = "Others";
      if (categoryDrv || categoryDrv == 0) {
        categoryDerived = categoryNames[categoryDrv];
      }
      console.log("result: ", rerankCategory.results[0]);

      const categoryScore = rerankCategory.results[0]?.relevanceScore || 0;
      const finalCategory = categoryScore > CATEGORY_THRESHOLD ? String(categoryDerived) : "Others";
      console.log('category derived:', finalCategory, 'with score:', categoryScore);
      if (finalCategory !== "Others") {
        categories.push(finalCategory);
      }
      else break;
    }

    if (categories.length === 0) categories.push("Others");

    console.log('all categories of this news:', categories);
    for (const category of categories) {
      console.log(`Category: ${category}`);
    }

    if (isNew)
      handleNewArticle(article, categories)
    else
      handleRelatedArticle(article, categories, relatedLink, relatedScore);

    await (await index).upsertRecords([{
      id: article.link,
      chunk_text: queryText,
      category: article.source || "",
    }]);

    console.log(`Processed: ${article.title}`);
  } catch (err) {
    console.error(`Failed to process article: ${article.title}`, err);
  }
};

export const processNewsFromFile = async (jsonName: string) => {
  const articlePath = mode === "development" ? `./${jsonName}` : `./cron/${jsonName}`;
  readFile(articlePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading articles file:', err);
      return;
    }
    try {
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
        if (canWeProcessArticle) {
          await processArticle(article);
        } else {
          console.warn(`Skipping processing of article due to missing required fields.`);
        }

        await new Promise(resolve => setTimeout(() => {
          resolve("to ensure rate limit not reached by pincone")
        }, 500))
      }

      await notifyServerOfNewArticles(BACKEND_URL);

    } catch (parseError) {
      console.error('Error parsing articles JSON:', parseError);
    }
  });
};


