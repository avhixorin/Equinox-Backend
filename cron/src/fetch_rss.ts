import Parser from 'rss-parser';
import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config()
const mode = process.env.MODE || "development";

const parser = new Parser({
    customFields: {
        item: [
            ['media:thumbnail', 'mediaThumbnail'],
            ['media:content', 'mediaContent'],
            ['enclosure', 'enclosure'],
        ]
    }
});

const rssFeeds = [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.thehindu.com/news/national/feeder/default.rss',
    'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
    'https://feeds.feedburner.com/ndtvnews-top-stories'
];

const HOW_MUCH_ARTICLES_TO_TAKE_FROM_EACH_SOURCES = [20, 20, 20, 20]

const isToday = (dateString: any) => {
    const today = new Date();
    const pubDate = new Date(dateString);
    return (
        today.getUTCFullYear() === pubDate.getUTCFullYear() &&
        today.getUTCMonth() === pubDate.getUTCMonth() &&
        today.getUTCDate() === pubDate.getUTCDate()
    );
};


export const fetchFnc = async () => {

    let count = 0;

    function extractImageUrl(item: any) {
        if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
        if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
        if (item.enclosure?.url) return item.enclosure.url;
        return "";
    }

    const sourcesArr = ["BBC News", "India Latest News: Top National Headlines Today & Breaking News | The Hindu", "Times of India", "NDTV News Search Records Found 1000"];
    type source = typeof sourcesArr[number];
    const sourceMap: Record<source, string> = {
        "BBC News": "BBC",
        "India Latest News: Top National Headlines Today & Breaking News | The Hindu": "The Hindu",
        "Times of India": "Times of India",
        "NDTV News Search Records Found 1000": "NDTV"
    }

    function extractTitle(title: source) {
        return sourceMap[title] || title;
    }


    const allArticles = [];


    for (let feedNumber = 0; feedNumber < rssFeeds.length; feedNumber++) {
        const feedUrl = rssFeeds[feedNumber];
        try {
            const feed = await parser.parseURL(feedUrl);
            if (!feed.title) continue;
            let articleTaken = 0;
            for (const item of feed.items) {
                if (item.pubDate && isToday(item.pubDate)) {
                    const article = {
                        title: item.title,
                        link: item.link,
                        pubDate: item.pubDate,
                        content: item.contentSnippet || '',
                        source: extractTitle(feed.title),
                        imageUrl: extractImageUrl(item)

                    };
                    allArticles.push(article);
                    count++;
                    articleTaken++;
                    if (articleTaken >= HOW_MUCH_ARTICLES_TO_TAKE_FROM_EACH_SOURCES[feedNumber]) break;
                }
            }
        } catch (err) {
            console.error(`Failed to fetch ${feedUrl}:`, err);
        }
    }

    console.log(`fetched ${count} articles".`);
    const writePath = mode === "development" ? 'articles.json' : "./cron/articles.json";
    await writeFile(writePath, JSON.stringify(allArticles, null, 2))
    console.log("✅ Successfully wrote articles.json");
}

