import { categoryIndex, index } from "./createIndex.js";
import { PrismaClient } from "@prisma/client"
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { readFile } from 'fs'

dotenv.config({
  path: './.env',
  override: true,
  debug: true,
  encoding: 'utf8',

})

const THRESHOLD_FOR_SIMILARITY = 0.5;
const DATABASE_URL = process.env.DATABASE_URL;
const BACKEND_URL = process.env.BACKEND_GRAPHQL_URL

if (!DATABASE_URL || !BACKEND_URL) {
  console.error("Missing required environment variables: BACKEND_GRAPHQL_URL, DATABASE_URL");
  process.exit(1);
}

const prisma = new PrismaClient()

interface Article {
  link: string;
  title: string;
  content?: string;
  source?: string;
  pubDate: Date
  imageUrl?: string,
}

const processArticle = async (article: Article) => {
  console.log(`\n\nprocesing new articles:\n`)
  try {
    const queryText = `${article.title}. ${article.content}`;

    let rerankedResults = null;

    try {
      rerankedResults = await (await index).searchRecords({
        query: { topK: 10, inputs: { text: queryText } },
        rerank: { model: 'bge-reranker-v2-m3', topN: 1, rankFields: ['chunk_text'] },
      });
    } catch (error) {
      rerankedResults = await (await index).searchRecords({
        query: { topK: 10, inputs: { text: queryText } },
      });
      console.log("bg-ranker limit reached")
    }

    if (!rerankedResults) throw new Error("could not find relevancy search on this article!")

    const record = {
      id: article.link,
      chunk_text: `${article.title} ${article.content}`,
      category: article.source || "",
    };

    await (await index).upsertRecords([record]);

    const isNew = rerankedResults.result.hits.length === 0 || rerankedResults.result.hits[0]._score < THRESHOLD_FOR_SIMILARITY;

    let rerankedResultsOfCategory = null;
    try {

      try {
        rerankedResultsOfCategory = await (await categoryIndex).searchRecords({
          query: { topK: 10, inputs: { text: queryText } },
          rerank: { model: 'bge-reranker-v2-m3', topN: 4, rankFields: ['chunk_text'] },
        });
      } catch (error) {
        rerankedResultsOfCategory = await (await categoryIndex).searchRecords({
          query: { topK: 5, inputs: { text: queryText } },
        });
        console.log("bg-ranker limit reached ")
      }

      if (!rerankedResultsOfCategory) throw new Error("could not find out its category!")

    } catch (error) {
      console.error("Error fetching reranked category results:", error);
    }

    let categoryDerived = (rerankedResultsOfCategory?.result?.hits[0]?.fields as { chunk_text?: string })?.chunk_text

    if (!categoryDerived) categoryDerived = "unknown";

    if (isNew) {
      console.log("new NEWS")

      const news = await prisma.news.create({
        data: {
          category: categoryDerived
        }
      });

      if (!news) throw new Error("error making parent news")

      const miniNews = await prisma.miniNews.create({
        data: {
          title: article.title,
          content: article.content,
          link: article.link,
          source: article.source,
          pubDate: article.pubDate,
          imageUrl: article.imageUrl,
          newsId: news.id,
          category: categoryDerived
        }
      });

    } else {
      const arLink = rerankedResults.result.hits[0]._id as string;
      const relevantArticle = await prisma.miniNews.findFirst({
        where: {
          link: arLink
        },
      });
      if (relevantArticle) {
        console.log(`Relevant news/child news`);
        const parentId = relevantArticle.newsId;
        const newChildNews = await prisma.miniNews.create({
          data: {
            title: article.title,
            content: article.content,
            link: article.link,
            source: article.source,
            pubDate: article.pubDate,
            imageUrl: article.imageUrl,
            newsId: parentId,
            category: categoryDerived
          }
        });

        if (!newChildNews) throw new Error("could not create new child news!")

      } else {
        console.warn(`Relevant article not found: ${rerankedResults.result.hits[0]._id}`);
      }
    }
    console.log(`Processed: ${article.title}`);
  } catch (error) {
    console.error(`Failed to process article: ${article.title}`, error);
  }
};

export const mainInit = async () => {
  readFile('./articles.json', 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading articles file:', err);
      return;
    }
    try {
      const articles: Article[] = JSON.parse(data);
      console.log('Articles loaded successfully:', articles.length);

      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        article.pubDate = new Date()
        if (article.link && article.title && article.source) {
          await processArticle(article);
        } else {
          console.warn(`Skipping invalid article: ${JSON.stringify(article)}`);
        }

        await new Promise(resolve => setTimeout(() => {
          resolve("to ensure rate limit not reached by pincone")
        }, 500))
      }

      await notifyServerOfNewArticles();

    } catch (parseError) {
      console.error('Error parsing articles JSON:', parseError);
    }
  });
};

const notifyServerOfNewArticles = async () => {
  const graphqlEndpoint = BACKEND_URL;

  const mutation = `
    mutation {
      notifyAddedNews
    }
  `;

  try {
    const res = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation })
    });

    const result = await res.json();
    console.log("notifyAddedNews response:", result);
  } catch (err) {
    console.error("Failed to notify server:", err);
  }
};

mainInit();

