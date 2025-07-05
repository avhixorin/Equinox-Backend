import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { title } from 'process';
import { link } from 'joi';

const prisma = new PrismaClient();
const TwitterChannels = [
  "aajtak",
  "bbc",
  "AJEnglish",
  "dwnews",
  "reuters",
  "cnn",
  "France24_en",
  "SkyNews",
  "npr",
  "NewsHour",
  "BusinessInsider",
  "VICENews",
  "ABPNews",
  "IndiaTV",
  "ZeeNews",
  "News18India",
  "TheLallantop",
  "abplive",
  "Republic_Bharat",
  "ndtv",
  "the_hindu",
  "WIONews",
  "JamunaTV",
];

const isToday = (dateStr: string) => {
  console.log("Checking if date is today:", dateStr);

  const cleanedStr = dateStr.replace('·', '').replace(/\s+/g, ' ').trim();
  const tweetDate = new Date(cleanedStr);

  if (isNaN(tweetDate.getTime())) {
    console.log("Invalid date after parsing:", cleanedStr);
    return false;
  }

  console.log("Parsed tweet date:", tweetDate.toISOString());

  const today = new Date();
  return (
    tweetDate.getUTCFullYear() === today.getUTCFullYear() &&
    tweetDate.getUTCMonth() === today.getUTCMonth() &&
    tweetDate.getUTCDate() === today.getUTCDate()
  );
};

function cleanTitle(raw: string, maxLength: number = 100): string {
  return raw
    .replace(/[\n\r]+/g, ' ')                            // Remove newlines
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')              // Remove emojis (emoticons)
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')              // Remove emojis (symbols & pictographs)
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')              // Remove emojis (transport & map)
    .replace(/[\u{2600}-\u{26FF}]/gu, '')                // Remove misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')                // Remove dingbats
    .replace(/[^a-zA-Z0-9 .,!?'"@#:/\-–—]+/g, '')        // Remove other gibberish
    .replace(/\s{2,}/g, ' ')                             // Collapse multiple spaces
    .trim()
    .slice(0, maxLength)
    .concat(raw.length > maxLength ? '...' : '');
}


function constructImageUrl(rawSrc: string
  | null | undefined
): string {
  if (!rawSrc) return "";

  let cleanPath = rawSrc.replace(/^\/?pic\//, "");
  return `https://nitter.net/pic/${cleanPath}`;
}

const scrapeTweets = async () => {
  const allTweets: any[] = [];

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  for (const source of TwitterChannels) {
    const url = `https://nitter.net/${source}`;
    console.log(`🔍 Scraping tweets from ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('.timeline-item', { timeout: 10000 });
      await new Promise(res => setTimeout(res, 2000));

      const html = await page.content();
      const $ = cheerio.load(html);
      console.log("Found tweets:", $('.timeline-item').length);

      $('.timeline-item').slice(0, 10).each(async (_, el) => {
        let content = $(el).find('.tweet-content.media-body').text().trim()

        content = content.split("#")[0].trim()
        content = content.split("https://")[0].trim()
        content = content.split("  ")[0].trim()
        content = content.split(". .")[0].trim()
        content = content.split("..")[0].trim()
        content = content.split(":")[0].trim()
        content = cleanTitle(content, 100).trim()


        const time = $(el).find('.tweet-date a').attr('title') || '';

        let imageEl = $(el).find(".card-image-container img").first()

        if (!imageEl || imageEl.length === 0) {
          imageEl = $(el).find(".attachment .video-container img").first()
        }

        const rawSrc = imageEl.attr("src");

        let imageUrl = constructImageUrl(rawSrc);
        const nitterHref = $(el).find('.tweet-link').attr('href') || $(el).find('.tweet-date a').attr('href');
        let twitterUrl = '';
        if (nitterHref && /^\/[a-zA-Z0-9_]+\/status\/\d+/.test(nitterHref)) {
          const cleanPath = nitterHref.split('#')[0];
          twitterUrl = `https://x.com${cleanPath}`;
        }

        if (!time || !isToday(time)) {
          console.log("Skipping tweet due to invalid date:", time);
          return;
        }
        

        const cleanedStr = time.replace('·', '').replace(/\s+/g, ' ').trim();
        const tweetDate = new Date(cleanedStr);

        const tweetNews = {
          title: content,
          link: twitterUrl,
          pubDate: tweetDate,
          source,
          imageUrl,
          youtube: false,
          twitter: true,
          views: null
        }

        console.log("Tweet data:", tweetNews);
        if (!tweetNews.title || tweetNews.title.length < 20 || tweetNews.title.startsWith("Enable hls") || !tweetNews.link || !tweetDate) {
          console.log("Skipping tweet due to missing or invalid data:", tweetNews);
          return;
        }

        try {
          const news = await prisma.news.create({ data: { category: [] } })
          await prisma.miniNews.create({
            data: {
              title: tweetNews.title,
              link: tweetNews.link,
              pubDate: tweetDate,
              source: tweetNews.source || "unknown source",
              imageUrl: tweetNews.imageUrl || "",
              twitter: true,
              newsId: news.id
            }
          });
          console.log(`Saved tweet: ${tweetNews.title} from ${tweetNews.source}`);
        } catch (error) {
          console.error("Error saving tweet to database:", error);
        }
      });

    } catch (err) {
      console.error(`Failed scraping ${url}`, err);
    }
  }

  await browser.close();
  // await writeFile('twitter-articles.json', JSON.stringify(allTweets, null, 2));
  console.log(`Scraped ${allTweets.length} tweets with images`);
};

scrapeTweets();
