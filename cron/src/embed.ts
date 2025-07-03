import { index } from "./createIndex.js";
import { PrismaClient } from "@prisma/client";
import { CohereClient } from "cohere-ai";
import { readFile } from 'fs'
import { extract as getLongDesc } from "./util/updateLongDescription.js";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config()

const prisma = new PrismaClient();

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

const COHERE_DELAY_MS = 10000;
const SIMILARITY_THRESHOLD = 0.40;
const SIMILARITY_THRESHOLD_YT = 0.5;
const CATEGORY_THRESHOLD = 0.025;
const CATEGORY_THRESHOLD_YT = 0.03;

const categoryDocs = [
  `Category: Sports
Description: News about competitive physical games, athletes, teams, leagues, tournaments, and major sporting events.
Examples:
- Messi scores hat-trick as Argentina wins Copa America.
- Olympic Games postponed due to extreme heat.
- Indian cricketer suspended for match-fixing scandal.
- NBA star announces retirement after 20-year career.
- FIFA investigates referee conduct after controversial final.`,

  `Category: Politics
Description: Political parties, elections, leaders, legislation, and diplomatic events — excludes general protests unless clearly political.News about governments, elections, leaders, policy decisions, international relations, and diplomatic matters. Includes actions or statements by influential state-affiliated figures.
Examples:
- UK Prime Minister meets EU leaders to discuss trade deal.
- Pro-democracy candidate wins landslide election in Thailand.
- Parliament passes controversial immigration bill.
- President vetoes healthcare reform plan.
- King Charles cancels Middle East visit due to regional conflict concerns
- Opposition leader arrested ahead of national elections.`,

  `Category: Government
Description: Government policy, state actions, public institutions — separate from political debate.
Examples:
- Ministry of Finance proposes new tax code.
- Public transport authority launches metro expansion plan.
- Government allocates $3B for rural education.
- Officials roll out digital ID system across the state.
- State government to provide free internet in public libraries.`,

  `Category: Business
Description: Economy, companies, market trends, finance, and trade — includes industry protests or pricing issues.
Examples:
- Mango farmers protest market crash in Tamil Nadu.
- Tesla beats earnings estimates, stock jumps 7%.
- Inflation impacts grocery prices nationwide.
- Amazon expands same-day delivery in India.
- Indian rupee weakens against dollar amid global uncertainty.`,

  `Category: Agriculture
Description: Farming, crop issues, food supply chains, and rural livelihoods — includes farmer protests.
Examples:
- Farmers dump tomatoes on highway to protest price crash.
- Locust swarm devastates cotton crops in Gujarat.
- Govt announces support price for rice farmers.
- Dairy unions demand better milk procurement rates.
- Floods destroy paddy fields across eastern Assam.`,

  `Category: Health
Description: Public health alerts, medical research, disease outbreaks, mental health, and hospital infrastructure.
Examples:
- WHO declares new virus outbreak in Southeast Asia.
- Breakthrough in cancer treatment shows 90% success rate.
- Hospital staff strike over working conditions.
- Mental health hotline receives record number of calls.
- Surge in respiratory illnesses linked to urban air pollution.`,

  `Category: Science
Description: Scientific discoveries, research studies, natural phenomena, and innovation in physical or life sciences.
Examples:
- Scientists detect signals from distant galaxy.
- New AI model maps ocean floor with 95% accuracy.
- Research links climate change to animal migration patterns.
- Volcano study reveals pre-eruption chemical signature.
- Study finds microplastics in Antarctic snow.`,

  `Category: Technology
Description: Tech innovation, gadgets, apps, startups, and cybersecurity — excludes generic business stories unless tech-focused.
Examples:
- Apple unveils iPhone with neural interface chip.
- Google pauses AI chatbot after controversial responses.
- Cyberattack hits major Indian bank.
- New startup uses drones for warehouse logistics.
- Microsoft introduces real-time translation in video calls.`,

  `Category: Crime
Description: Arrests, investigations, trials, terrorism, and illegal activities — includes charges against public figures.
Examples:
- Rapper arrested on terror charge, released on bail.
- Man sentenced to life for serial killings.
- Police uncover international smuggling network.
- Tech CEO charged with insider trading.
- Woman caught attempting to smuggle gold in shoe soles.`,

  `Category: Accidents
  Description: Unintended harmful events like crashes, natural disasters, and technical failures — excludes intentional crimes.
  Examples:
  - Train derails in Odisha, killing 50 passengers.
  - Amusement park ride malfunctions, injures 12.
  - Factory explosion in China causes massive fire.
  - Volcano in Indonesia spews ash 11km high, prompting flight alerts.
  - Floods submerge dozens of villages in Assam.
  - Landslide in Himachal traps tourists in remote valley.`,

  `Category: Entertainment
Description: Celebrities, film, music, television, arts — includes celebrity gossip, cultural events, and awards.
Examples:
- Irish hip-hop group Kneecap releases new album.
- Actor wins Best Director at Cannes Film Festival.
- Singer arrested in DUI case, fans divided.
- Bollywood legend honored with lifetime achievement award.
- Netflix announces reboot of cult classic 90s show.`,

  `Category: Environment
Description: Climate change, pollution, conservation, disasters related to natural systems.
Examples:
- Amazon deforestation hits 15-year high.
- Heatwave in Europe sparks wildfires.
- Coral bleaching spreads due to rising ocean temperatures.
- UN climate report warns of tipping points.
- River cleanup drive removes 20 tons of plastic waste.`,

  `Category: Education
Description: Schools, colleges, exams, policies, student protests (if academic), and reforms in education.
Examples:
- Board exams delayed due to teacher strike.
- University introduces AI to personalize learning.
- Students protest against fee hike at Delhi University.
- Govt launches literacy program in tribal regions.
- High school integrates climate studies into curriculum.`,

  `Category: Military
Description: Armed forces, war, weapons, military alliances, defense operations. 
Examples:
- Indian Army conducts operation near LoC.
- NATO launches joint exercises in the Baltic.
- Drone strike targets rebel base in Syria.
- A hospital in the Israeli town of Beersheba was hit as Iran fired a barrage of missiles at the country. focus on missiles attacks
- Govt signs $8B arms deal with US defense contractor.
- Military satellite launch enhances surveillance capability.`,

  `Category: Religion
Description: Faith, religious leaders, pilgrimages, community events, conflicts tied to religion.
Examples:
- Pope visits Gaza for peace mission.
- Hindu festival attracts 1.5 million pilgrims.
- Mosque vandalized in communal clash.
- Religious leaders oppose new marriage bill.
- Sikh community organizes blood donation drive during Gurpurab.`,

  `Category: Startup
Description: Young businesses, venture capital, product launches, and entrepreneurship. Corporate policies, layoffs, internal memos, workplace regulations.
Examples:
- AI startup raises $25M for fraud detection software.
- Healthtech firm builds wearable for diabetes tracking.
- Agritech startup helps small farmers sell directly.
- Founders of social app featured in Forbes 30 Under 30.
- Google lays off 1,000 employees in cost-cutting move
- Edtech startup offers free upskilling to rural youth.`
];

const categoryNames = [
  "Sports",
  "Politics",
  "Government",
  "Business",
  "Agriculture",
  "Health",
  "Science",
  "Technology",
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
  youtube?: boolean;
  views?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const processArticle = async (article: Article) => {
  console.log(`\n\n[+] Processing article: ${article.title}`);

  try {
    const queryText = `${article.title}. ${article.content}`;

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
        topN: 1
      });

      relatedScore = rerankRelated.results[0]?.relevanceScore || 0;
      isNew = relatedScore < SIMILARITY_THRESHOLD;
      const relatedIndex = rerankRelated.results[0]?.index ?? 0;
      relatedLink = topNewsLinks[relatedIndex];
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


    if (isNew) {
      const news = await prisma.news.create({
        data: { category: categories }
      });

      const miniNews = await prisma.miniNews.create({
        data: {
          title: article.title,
          content: article.content,
          link: article.link,
          source: article.source,
          pubDate: article.pubDate,
          imageUrl: article.imageUrl,
          newsId: news.id,
          category: categories,
          score: 1.2,
          youtube: article.youtube || false,
          ytViews: article.views || 0
        }
      });


      await getLongDesc({ id: miniNews.id, link: miniNews.link });
    }
    else {
      const relevantArticle = await prisma.miniNews.findFirst({
        where: { link: relatedLink },
        include: { news: true }
      });

      const oldCategories = relevantArticle?.news.category || [];

      if (oldCategories[0] !== "Others" && categories[0] !== "Others") {
        const newCategories = [...new Set([...oldCategories, ...categories])];

        console.log("Updating existing article with new categories:", newCategories);

        await prisma.news.update({
          where: { id: relevantArticle?.newsId },
          data: {
            category: newCategories,
          }
        });
      }

      if (relevantArticle) {
        const miniNews = await prisma.miniNews.create({
          data: {
            title: article.title,
            content: article.content,
            link: article.link,
            source: article.source,
            pubDate: article.pubDate,
            imageUrl: article.imageUrl,
            newsId: relevantArticle.newsId,
            category: categories,
            score: relatedScore.toFixed(2),
            youtube: article.youtube || false,
            ytViews: article.views || 0
          }
        });


        await getLongDesc({ id: miniNews.id, link: miniNews.link });
      } else {
        console.warn("Related article not found in DB, skipping child creation.");
      }
    }

    await (await index).upsertRecords([{
      id: article.link,
      chunk_text: queryText,
      category: article.source || "",
    }]);

    console.log(`✅ Processed: ${article.title}`);
  } catch (err) {
    console.error(`❌ Failed to process article: ${article.title}`, err);
  }
};

export const mainInit = async () => {
  const articlePath = mode === "development" ? './articles.json' : './cron/articles.json';
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

export const mainInitForYt = async () => {
  const articlePath = mode === "development" ? './yt-articles.json' : './cron/yt-articles.json';
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
