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
    "https://www.thehindu.com/news/national/feeder/default.rss",
    "https://indianexpress.com/section/india/feed/",
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    'https://feeds.feedburner.com/ndtvnews-top-stories',
    "https://www.firstpost.com/commonfeeds/v1/mfp/rss/india.xml",
    "https://www.dnaindia.com/feeds/india.xml",
    "https://prod-qt-images.s3.amazonaws.com/production/thequint/feed.xml",
    "https://feeds.feedburner.com/ScrollinArticles.rss",
    "https://www.storifynews.com/feed/",
    "https://www.amarujala.com/rss/breaking-news.xml",
    "https://www.abcrnews.com/feed/",
    "https://thetimesofbengal.com/feed/",
    "https://digpu.com/feed",
    "https://www.agranews.com/feed/",
    "https://thenorthlines.com/feed/",
    "https://chandigarhmetro.com/feed/",
    "https://telanganatoday.com/feed",
    "https://www.dailyexcelsior.com/feed/",
    "https://www.indiavision.com/feed/",
    "https://www.opindia.com/feed/",
    "https://www.orissapost.com/feed/",
    "https://vindhyafirst.com/feed/",
    "https://techgenyz.com/feed/",
    "https://www.indiatvnews.com/rssnews/topstory.xml",
    "https://www.news18.com/commonfeeds/v1/eng/rss/india.xml"
];

console.log("total news sources: ", rssFeeds.length);

const HOW_MUCH_ARTICLES_TO_TAKE_FROM_EACH_SOURCES = [
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 20, 20, 20, 20
];


console.log("How much articles to take from each source array length: ", HOW_MUCH_ARTICLES_TO_TAKE_FROM_EACH_SOURCES.length);
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

    const sourcesArr = [
        "Times of India",
        "India | The Indian Express",
        "NDTV News Search Records Found 1000",
        "Firstpost Latest News",
        "The Quint",
        "India News",
        "Scroll.in",
        "Storify News",
        "Digpu News",
        "Latest And Breaking Hindi News Headlines, News In Hindi | अमर उजाला हिंदी न्यूज़ | - Amar Ujala",
        "AbcrNews",
        "The Times of Bengal",
        "Agra News, India News",
        "Northlines",
        "Chandigarh Metro",
        "Telangana Today",
        "Daily Excelsior",
        "IndiaVision India News & Information",
        "OpIndia",
        "Odisha News, Odisha Latest news, Odisha Daily – OrissaPOST",
        "Vindhya First",
        "Techgenyz",
        "IndiaTV: Google News Feed",
        "India News in news18.com, India Latest News, India News",
        "India Latest News: Top National Headlines Today & Breaking News | The Hindu"
    ];
    console.log("sourcesArr length: ", sourcesArr.length);

    type source = typeof sourcesArr[number];

    const sourceMap: Record<source, string> = {
        "Times of India": "Times of India",
        "India | The Indian Express": "The Indian Express",
        "India Latest News: Top National Headlines Today & Breaking News | The Hindu": "The Hindu",
        "NDTV News Search Records Found 1000": "NDTV",
        "Firstpost Latest News": "Firstpost",
        "The Quint": "The Quint",
        "India News": "DNA",
        "Scroll.in": "Scroll",
        "Storify News": "Storify",
        "Latest And Breaking Hindi News Headlines, News In Hindi | अमर उजाला हिंदी न्यूज़ | - Amar Ujala": "Amar Ujala",
        "AbcrNews": "AbcrNews",
        "The Times of Bengal": "The Times of Bengal",
        "Agra News, India News": "Agra News",
        "Northlines": "Northlines",
        "Chandigarh Metro": "Chandigarh Metro",
        "Telangana Today": "Telangana Today",
        "Daily Excelsior": "Daily Excelsior",
        "IndiaVision India News & Information": "IndiaVision",
        "OpIndia": "OpIndia",
        "Digpu News": "Digpu News",
        "Odisha News, Odisha Latest news, Odisha Daily – OrissaPOST": "OrissaPOST",
        "Vindhya First": "Vindhya First",
        "Techgenyz": "Techgenyz",
        "IndiaTV: Google News Feed": "IndiaTV",
        "India News in news18.com, India Latest News, India News": "News18"
    };
    console.log("sourceMap length: ", Object.keys(sourceMap).length);


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
                        imageUrl: extractImageUrl(item),
                        youtube: false,

                    };
                    allArticles.push(article);
                    count++;
                    articleTaken++;
                    if (articleTaken >= HOW_MUCH_ARTICLES_TO_TAKE_FROM_EACH_SOURCES[feedNumber]) break;
                }


            }
            if (articleTaken > 0) console.log(`fetched ${articleTaken} articles from ${extractTitle(feed.title)}".`);
        } catch (err) {
            console.error(`Failed to fetch ${feedUrl}:`, err);
        }
    }

    console.log(`fetched ${count} articles".`);
    const writePath = mode === "development" ? 'articles.json' : "./cron/articles.json";
    await writeFile(writePath, JSON.stringify(allArticles, null, 2))
    console.log("✅ Successfully wrote articles.json");
}




