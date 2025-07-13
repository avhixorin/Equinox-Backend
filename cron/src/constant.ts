export const tweetLimitFromEachSource = 10;
export const ytLimitFromEachSource = 10;
export const websiteLimitFromEachSource = 15;

export enum MatchType {
    UNRELATED = "unrelated",
    TIMELINE = "timeline",
    SAME_EVENT = "same-event"
}

export interface ResultJson {
    matchType: MatchType;
    id: string;
}

export interface newsDataForCategory {
    title: string;
    content: string;
}

export interface newsDataForAi {
    id: string;
    title: string;
    content: string;
    pubDate: string
}

export interface Article {
    link: string;
    title: string;
    content?: string;
    source: string;
    pubDate: Date;
    imageUrl?: string;
    youtube?: boolean;
    views?: number;
    twitter?: boolean;
}
export const systemPromptForCategory = "You are a highly reliable and context-aware news classification model"
export const systemPrompt = "You are a highly capable news intelligence model. Your job is to identify and group semantically and contextually related news articles based on real-world event similarity. Only return raw JSON."

export const DELAY_MS = 10000;
export const SIMILARITY_THRESHOLD = 0.15;

export const websiteRssFeeds = [
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

export const websiteSourceMapForBetterName: Record<string, string> = {
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

export const ytChannelIdMap = {
    "BBC India": "UCF4QKhPMP1JybbkIJzIayww",
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
    "Piers Morgan Uncensored": "UCatt7TBjfBkiJWx8khav_Gg",
    "Jansatta News": "UCICJyUwBYgUOE35F8klEoYw",
    "Republic TV": "UCwqusr8YDwM‑3mEYTDeJHzw",
    "News9 Live": "UCRK4FDIkUyslEAUdyRDdCtQ",
    "ET Now": "UCI_mwTKUhicNzFrhm33MzBQ",
    "Mirror Now": "UCWCEYVwSqr7Epo6sSCfUgiw",
    "DD India": "UCGDQNvybfDDeGTf4GtigXaw",
    "Economic Times": "UCJFOER35ggIWwsXh2ZDnqyg",
    "Business Today": "UCaPHWiExfUWaKsUtENLCv5w",
    "NDTV Profit": "UC3uJIdRFTGgLWrUziaHbzrg",
    "Firstpost": "UCz8QaiQxApLq8sLNcszYyJw",
    "The Quint": "UCSaf-7p3J_N-02p7jHzm5tA",
    "Scroll.in": "UCl8zB2LZOiLLV0jYUMpTEgA",
    "The News Minute": "UCspQie3i29iIFbCgfGisO9Q",
    "The Wire Live": "UChWtJey46brNr7qHQpN6KLQ",
}

export const ytChannels = [
    "The Wire Live",
    "The News Minute",
    "Scroll.in",
    "The Quint",
    "Firstpost",
    "NDTV Profit",
    "Business Today",
    "Economic Times",
    "DD India",
    "BBC India",
    "Mirror Now",
    "ET Now",
    "Republic TV",
    "News9 Live",
    "Jansatta News",
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

export const TwitterChannels = [
    "CNNnews18",
    "AmarUjalaNews",
    "dna",
    "thewire_in",
    "firstpost",
    "timesofindia",
    "IndianExpress",
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
    "storifynews"
];

export const categoryNames = [
    "Sports",
    "Politics",
    "Government",
    "Business",
    "Agriculture",
    "Health",
    "Science",
    "Technology",
    "Crime",
    "Entertainment",
    "Environment",
    "Education",
    "Military",
    "Religion",
    "Startup"
];


console.log("website rss feeds:", websiteRssFeeds.length);
console.log("youtube channels:", ytChannels.length);
console.log("twitter channels:", TwitterChannels.length);
