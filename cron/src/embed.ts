import { index } from "./createIndex.js";
import { PrismaClient } from "@prisma/client";
import { CohereClient } from "cohere-ai";
import dotenv from 'dotenv';
import { readFile } from 'fs'
import fetch from 'node-fetch';

dotenv.config();

const prisma = new PrismaClient();

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const BACKEND_URL = process.env.BACKEND_GRAPHQL_URL

if (!BACKEND_URL) {
  console.error("Missing required environment variables: BACKEND_GRAPHQL_URL");
  process.exit(1);
}


if (!COHERE_API_KEY) {
  throw new Error("COHERE_API_KEY is missing from environment variables.");
}
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!, // ensure .env has COHERE_API_KEY
});

const COHERE_DELAY_MS = 1000; // 1 second between requests
const SIMILARITY_THRESHOLD = 0.7;
const CATEGORY_THRESHOLD = 0.01;

const categoryDocs = [
  // Sports
  `Category: Sports
Examples: 
- Messi scores winning goal for Argentina in Copa America.
- India defeats Pakistan in T20 World Cup thriller.
- Serena Williams announces retirement from tennis.`,

  // Politics
  `Category: Politics
Examples: 
- US President addresses NATO summit on global security.
- Elections in France result in major political shift.
- Prime Minister reshuffles cabinet ahead of general elections.`,

  // Business
  `Category: Business
Examples:
- Tesla announces record-breaking quarterly earnings.
- Amazon acquires startup for $1.2 billion.
- Inflation impacts small business profitability.`,

  // Health
  `Category: Health
Examples:
- WHO issues warning over new virus strain in Asia.
- Study finds new treatment for Alzheimer's disease.
- Funfair accident leaves child with critical injuries.`,

  // Science
  `Category: Science
Examples:
- NASA confirms discovery of Earth-like exoplanet.
- Researchers develop new quantum computing technique.
- Ocean temperatures hit record highs, say scientists.`,

  // Technology
  `Category: Technology
Examples:
- Apple unveils new mixed-reality headset.
- Google announces AI upgrade to search engine.
- Cyberattack hits multiple hospitals across Europe.`,

  // Government
  `Category: Government
Examples:
- Parliament passes new privacy protection law.
- MI6 appoints first female chief in 116-year history.
- New infrastructure bill announced by the Ministry.`,

  // Crime
  `Category: Crime
Examples:
- Police arrest suspect in major drug trafficking operation.
- Teen charged with murder in London stabbing case.
- Grooming gangs targeted in national crackdown.`,

  // Accidents
  `Category: Accidents
Examples:
- Plane crashes in mountain region, 40 presumed dead.
- Amusement park ride malfunctions, injures 5.
- Factory fire in China leads to multiple casualties.`,

  // Entertainment
  `Category: Entertainment
Examples:
- Barbie movie breaks global box office record.
- Actor wins Oscar for biopic performance.
- Streaming platforms battle for rights to hit series.`,

  // Environment
  `Category: Environment
Examples:
- UN climate report warns of rising sea levels.
- Forest fires rage across Western Canada.
- Heatwave leads to water shortages in Europe.`,

  // Education
  `Category: Education
Examples:
- University introduces AI-powered learning assistant.
- Board exams delayed due to protests.
- Government allocates funds for school renovation.`,

  // Military
  `Category: Military
Examples:
- US conducts airstrikes in Syria.
- Israel launches counter-offensive after rocket attack.
- Defense Minister approves $10B arms deal.`,

  // Religion
  `Category: Religion
Examples:
- Pope visits war-torn region for peace mission.
- Hindu festival attracts millions in pilgrimage.
- Religious leaders speak out on social justice.`,

  // Startup
  `Category: Startup
Examples:
- Indian edtech startup raises $50M in Series B.
- AI-powered resume tool goes viral on LinkedIn.
- Founders of fintech startup featured in Forbes 30 Under 30.`
];

const categoryNames = [
  "Sports",
  "Politics",
  "Business",
  "Health",
  "Science",
  "Technology",
  "Government",
  "Crime",
  "Accidents",
  "Entertainment",
  "Environment",
  "Education",
  "Military",
  "Religion",
  "Startup"
];

interface Article {
  link: string;
  title: string;
  content?: string;
  source?: string;
  pubDate: Date;
  imageUrl?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processArticle = async (article: Article) => {
  console.log(`\n\n[+] Processing article: ${article.title}`);

  try {
    const queryText = `${article.title}. ${article.content}`;

    // Step 1: Vector search for top 10 related news
    const topNewsResults = await (await index).searchRecords({
      query: { topK: 10, inputs: { text: queryText } },
    });

    const topNewsChunks = topNewsResults.result.hits.map(
      hit => (hit.fields as { chunk_text?: string })?.chunk_text || ""
    );
    const topNewsLinks = topNewsResults.result.hits.map(hit => hit._id);

    // Step 2: Use Cohere to rerank these top 10 articles
    await sleep(COHERE_DELAY_MS);
    const rerankRelated = await cohere.rerank({
      query: queryText,
      documents: topNewsChunks,
      topN: 1
    });

    const relatedScore = rerankRelated.results[0]?.relevanceScore || 0;
    const isNew = relatedScore < SIMILARITY_THRESHOLD;
    const relatedIndex = rerankRelated.results[0]?.index ?? 0;
    const relatedLink = topNewsLinks[relatedIndex];

    console.log(`isNew: ${isNew}, score: ${relatedScore}, link: ${relatedLink}`);

    await sleep(COHERE_DELAY_MS);
    const rerankCategory = await cohere.rerank({
      query: queryText,
      documents: categoryDocs,
      topN: 1
    });

    const categoryDrv = rerankCategory.results[0]?.index
    let categoryDerived = "Others";
    if (categoryDrv || categoryDrv == 0) {
      categoryDerived = categoryNames[categoryDrv];
    }
    console.log("result: ", rerankCategory.results[0]);

    const categoryScore = rerankCategory.results[0]?.relevanceScore || 0;
    const finalCategory = categoryScore > CATEGORY_THRESHOLD ? String(categoryDerived) : "Others";

    console.log(`categoryDerived: ${categoryDerived}, Category: ${finalCategory}, score: ${categoryScore}`);

    // Step 4: Upsert into vector DB
    await (await index).upsertRecords([{
      id: article.link,
      chunk_text: queryText,
      category: article.source || "",
    }]);

    // Step 5: Store in DB
    if (isNew) {
      const news = await prisma.news.create({
        data: { category: finalCategory }
      });

      await prisma.miniNews.create({
        data: {
          title: article.title,
          content: article.content,
          link: article.link,
          source: article.source,
          pubDate: article.pubDate,
          imageUrl: article.imageUrl,
          newsId: news.id,
          category: finalCategory
        }
      });
    } else {
      const relevantArticle = await prisma.miniNews.findFirst({ where: { link: relatedLink } });
      if (relevantArticle) {
        await prisma.miniNews.create({
          data: {
            title: article.title,
            content: article.content,
            link: article.link,
            source: article.source,
            pubDate: article.pubDate,
            imageUrl: article.imageUrl,
            newsId: relevantArticle.newsId,
            category: finalCategory
          }
        });
      } else {
        console.warn("Related article not found in DB, skipping child creation.");
      }
    }

    console.log(`✅ Processed: ${article.title}`);
  } catch (err) {
    console.error(`❌ Failed to process article: ${article.title}`, err);
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
        const pubDateinDateType = new Date(article.pubDate);
        article.pubDate = pubDateinDateType;
        if (article.link && article.title && article.source && article.content && article.imageUrl) {
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