import Parser from 'rss-parser';
import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();
const mode = process.env.MODE || "development";

const parser = new Parser({
    customFields: {
        item: [
            ['media:group', 'mediaGroup'],
            ['yt:videoId', 'videoId'],
            ['yt:channelId', 'channelId'],
        ],
        feed: []
    }
});

const ChannelIdMap = {
    "Aaj Tak": "UCt4t-jeY85JegMlZ-E5UWtA",
    "ABP News": "UCRWFSbif-RFENbBrSiez1DA",
    "India TV": "UCttspZesZIDEwwpVIgoZtWQ",
    "ZEE News": "UCIvaYmXn910QMdemBG3v1pQ",
    "News18 India": "UCPP3etACgdUWvizcES1dJ8Q",
    "The Lallantop": "UCx8Z14PpntdaxCt2hakbQLQ",
    "ABPLIVE": "UCmphdqZNmqL72WJ2uyiNw5w",
    "Raffy Tulfo in Action": "UCxhygwqQ1ZMoBGQM2yEcNug",
    "Republic Bharat": "UC7wXt18f2iA3EDXeqAVuKng",
    "BBC News Hindi": "UCN7B-QD0Qgn2boVH5Q0pOWg",
    "TLDR News": "UCSMqateX8OA2s1wsOR2EgJA",
    "Breaking Points": "UCDRIjKy6eZOvKtOELtTdeUA",
    "The Young Turks": "UC1yBKRuGpC1tSM73A0ZjYjQ",
    "Redaktsiya": "UC1eFXmJNkjITxPFWTy6RsWg",
    "Jamuna TV Plus": "UCDj9HHrRUzlsTuPQN0PHxjw",
    "NDTV": "UCZFMm1mMw0F81Z37aaEzTUA",
    "The Hindu": "UC3njZ48-FDxLleBYaP0SZIg",
    "WION": "UC_gUM8rL-Lrg6O3adPW9K1g",
    "Al Jazeera English": "UCNye-wNBqNL5ZzHSJj3l8Bg",
    "BBC": "UCCj956IF62FbT7Gouszaj9w",
    "BBC News": "UC16niRr50-MSBwiO3YDb3RA",
    "DW News": "UCknLrEdhRCp1aegoMqRaCZg",
    "Reuters": "UChqUTb7kYRX8-EiaN3XFrSQ",
    "CNN": "UCupvZG-5ko_eiXAupbDfxWw",
    "France 24 English": "UCQfwfsi5VrQ8yKZ-UWmAEFg",
    "Sky News": "UCoMdktPbSTixAyNGwb-UYkQ",
    "NPR": "UCJnS2EsPfv46u1JR8cnD0NA",
    "Bloomberg News": "UChirEOpgFCupRAk5etXqPaA",
    "PBS NewsHour": "UC6ZFN9Tx6xh-skXCuRHCDpQ",
    "Business Insider": "UCcyq283he07B7_KUX07mmtA",
    "Vox": "UCLXo7UDZvByw2ixzpQCufnA",
    "VICE News": "UCZaT_X_mc0BI-djXOlfhqWQ",
    "Associated Press": "UC52X5wxOL_s5yw0dQk7NtgA",
    "Piers Morgan Uncensored": "UCatt7TBjfBkiJWx8khav_Gg"
}

const channels = [
    "Aaj Tak",
    "ABP News",
    "India TV",
    "ZEE News",
    "News18 India",
    "The Lallantop",
    "ABPLIVE",
    "Raffy Tulfo in Action",
    "Republic Bharat",
    "BBC News Hindi",
    "TLDR News",
    "Breaking Points",
    "The Young Turks",
    "Redaktsiya",
    "Jamuna TV Plus",
    "NDTV",
    "The Hindu",
    "WION",
    "Al Jazeera English",
    "BBC",
    "BBC News",
    "DW News",
    "Reuters",
    "CNN",
    "France 24 English",
    "Sky News",
    "NPR",
    "Bloomberg News",
    "PBS NewsHour",
    "Business Insider",
    "Vox",
    "VICE News",
    "Associated Press",
    "Piers Morgan Uncensored"
];

const ytRssFeeds = Object.entries(ChannelIdMap).map(([_, channelId]) => {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
})

const LIMIT = 5;

const isToday = (dateString: any) => {
    const today = new Date();
    const pubDate = new Date(dateString);
    return (
        today.getUTCFullYear() === pubDate.getUTCFullYear() &&
        today.getUTCMonth() === pubDate.getUTCMonth() &&
        today.getUTCDate() === pubDate.getUTCDate()
    );
};

const allLinks: string[] = []

export const fetchYouTubeArticles = async () => {
    const allVideos: any[] = [];
    let index = -1;
    for (const feedUrl of ytRssFeeds) {
        index++;
        try {
            const feed = await parser.parseURL(feedUrl);
            let limit = LIMIT;
            for (const entry of feed.items) {
                if (limit <= 0) break;

                let link = entry.link || `https://www.youtube.com/watch?v=${(entry as any).videoId}`
                if (allLinks.includes(link)) continue;
                const group = (entry as any).mediaGroup;

                const published = entry.pubDate;
                if (!published || !isToday(published)) continue;

                let content = group?.['media:description'][0] || ''

                if (content) content = content.split('http')[0].trim();
                if (content) content = content.split('#')[0].trim();
                if (content) content = content.split('\n')[0].trim();
                if (content) content = content.split('    ')[0].trim();

                const statistics = group?.['media:community']?.[0]?.['media:statistics']?.[0]?.$;
                const views = parseInt(statistics?.views || '0');


                const article = {
                    title: entry.title || '',
                    content,
                    imageUrl: group?.['media:thumbnail']?.[0]?.$?.url || '',
                    link,
                    pubDate: published,
                    source: channels[index] || 'Unknown Source',
                    youtube: true,
                    views
                };

                allVideos.push(article);
                limit--;
                allLinks.push(article.link);

            }
        } catch (err) {
            console.error(`❌ Failed to fetch from ${feedUrl}:`, err);
        }
    }

    console.log(`✅ Parsed ${allVideos.length} YouTube videos.`);
    const writePath = mode === "development" ? 'yt-articles.json' : './cron/yt-articles.json';
    await writeFile(writePath, JSON.stringify(allVideos, null, 2));
    console.log("✅ Successfully wrote yt-articles.json");

    allLinks.length = 0;
};

