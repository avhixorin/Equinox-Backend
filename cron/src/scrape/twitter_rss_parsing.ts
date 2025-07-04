import Parser from 'rss-parser';
import { writeFile } from 'fs/promises';

const TwitterChannels = {
  "aajtak": "aajtak"
  // Add more...
};

const feeds = Object.entries(TwitterChannels).map(
  ([source, handle]) => ({
    source,
    url: `https://nitter.net/${handle}/rss`
  })
);

const parser = new Parser();

const isToday = (date: string) => {
  const today = new Date();
  const pub = new Date(date);
  return (
    pub.getUTCFullYear() === today.getUTCFullYear() &&
    pub.getUTCMonth() === today.getUTCMonth() &&
    pub.getUTCDate() === today.getUTCDate()
  );
};

const fetchTwitterArticles = async () => {
  const tweets = [];

  for (const { source, url } of feeds) {
    try {
      const feed = await parser.parseURL(url);

      for (const entry of feed.items) {
        if (!entry.pubDate || !isToday(entry.pubDate)) continue;

        tweets.push({
          title: entry.title?.slice(0, 100) || '',
          content: entry.contentSnippet || '',
          link: entry.link,
          pubDate: entry.pubDate,
          source,
          imageUrl: '', // Optional: parse from content if possible
          youtube: false,
          twitter: true,
          views: null // Not available from Nitter RSS
        });
      }
    } catch (err) {
      console.error(`Failed to parse ${url}`, err);
    }
  }

  await writeFile('twitter-articles.json', JSON.stringify(tweets, null, 2));
  console.log(`✅ Scraped ${tweets.length} tweets`);
};

fetchTwitterArticles();
