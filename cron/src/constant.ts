export const tweetLimitFromEachSource = 10;
export const ytLimitFromEachSource = 10;
export const websiteLimitFromEachSource = 10;

export interface Article {
    link: string;
    title: string;
    content?: string;
    source?: string;
    pubDate: Date;
    imageUrl?: string;
    youtube?: boolean;
    views?: number;
    twitter?: boolean;
}

export const COHERE_DELAY_MS = 10000;
export const SIMILARITY_THRESHOLD = 0.40;
export const CATEGORY_THRESHOLD = 0.025;

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

export const ytChannels = [
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
    "Accidents",
    "Entertainment",
    "Environment",
    "Education",
    "Military",
    "Religion",
    "Startup"
];

export const categoryDocs = [
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
