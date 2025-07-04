import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';

dotenv.config()
const PINECONE_INDEX_NAME = 'midnews-js'
const PINECONE_CATEGORY_INDEX = 'categorynews'
const PINECONE_NAMESPACE = 'news-namespace'
const PINECONE_CATEGORY_NAMESPACE = 'category-news-namespace'


const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

if (!PINECONE_API_KEY) {
    console.error('Missing PINECONE_API_KEY in environment variables');
    process.exit(1);
}

const pc = new Pinecone({
    apiKey: PINECONE_API_KEY,
});

const categoryDocs = [
  `Category: Sports
Description:
Covers news related to athletic events, players, competitions, and achievements in sports worldwide.

Examples:
- Lionel Messi scores winning goal for Argentina in Copa America.
- India defeats Pakistan in T20 World Cup thriller.
- Serena Williams announces retirement from professional tennis.
- Cristiano Ronaldo sets new international goal record.
- Tokyo Olympics concludes with historic medal tally for Japan.`,

  `Category: Politics
Description:
Focuses on political events, leaders, elections, policies, and international diplomatic affairs.

Examples:
- US President addresses NATO summit on global security.
- Elections in France result in major political shift.
- Prime Minister reshuffles cabinet ahead of general elections.
- Opposition parties stage protest against new tax bill.
- UN Security Council meets to discuss conflict resolution.`,

  `Category: Business
Description:
Includes news on markets, companies, investments, acquisitions, and economic trends globally.

Examples:
- Tesla announces record-breaking quarterly earnings.
- Amazon acquires AI startup for $1.2 billion.
- Inflation impacts small business profitability in the U.S.
- Stock markets surge after Federal Reserve decision.
- Meta lays off 5,000 employees amid restructuring.`,

  `Category: Health
Description:
Deals with public health, medical research, pandemics, diseases, and healthcare policies.

Examples:
- WHO issues warning over new virus strain in Asia.
- Study finds promising treatment for Alzheimer’s disease.
- Hospitals report surge in dengue cases across India.
- COVID-19 booster recommended for vulnerable adults.
- Mental health awareness campaign launched nationwide.`,

  `Category: Science
Description:
Features discoveries, research breakthroughs, space missions, and environmental studies.

Examples:
- NASA confirms discovery of Earth-like exoplanet.
- Researchers develop revolutionary quantum computing method.
- Ocean temperatures hit record highs, say scientists.
- CERN announces new particle discovery in LHC experiment.
- Mars rover detects signs of ancient microbial life.`,

  `Category: Technology
Description:
Reports on innovations, product launches, tech company news, and cybersecurity issues.

Examples:
- Apple unveils new mixed-reality headset with spatial computing.
- Google announces AI-powered upgrade to search engine.
- Cyberattack hits multiple hospitals across Europe.
- Microsoft integrates Copilot AI into Windows OS.
- OpenAI launches new GPT model with multimodal capabilities.`,

  `Category: Government
Description:
Covers legislation, public policy, government reforms, and institutional decisions.

Examples:
- Parliament passes new privacy protection law.
- MI6 appoints first female chief in 116-year history.
- New infrastructure bill announced by the Ministry.
- Supreme Court rules on landmark free speech case.
- Budget proposal includes increase in education spending.`,

  `Category: Crime
Description:
Encompasses incidents of criminal activity, law enforcement actions, and investigations.

Examples:
- Police arrest suspect in major drug trafficking operation.
- Teen charged with murder in London stabbing case.
- Grooming gangs targeted in national crackdown.
- Serial burglary ring busted in international sting.
- Corruption scandal leads to resignation of city mayor.`,

  `Category: Accidents
Description:
Relates to unexpected incidents causing injury, death, or damage — often involving vehicles, workplaces, or public spaces.

Examples:
- Plane crashes in mountain region, 40 presumed dead.
- Amusement park ride malfunctions, injures 5.
- Factory fire in China leads to multiple casualties.
- Gas leak explosion in residential building kills 12.
- Train derailment causes major disruption and injuries.`,

  `Category: Entertainment
Description:
Highlights cinema, television, celebrities, music, award shows, and pop culture.

Examples:
- Barbie movie breaks global box office record.
- Actor wins Oscar for biopic performance.
- Streaming platforms battle for rights to hit series.
- Taylor Swift announces world tour dates.
- K-drama sets new streaming record on Netflix.`,

  `Category: Environment
Description:
Reports on climate change, natural disasters, sustainability efforts, and ecological impact.

Examples:
- UN climate report warns of rising sea levels.
- Forest fires rage across Western Canada.
- Heatwave leads to water shortages in Europe.
- New coral bleaching event observed in Australia’s reef.
- Countries sign treaty to reduce plastic pollution.`,

  `Category: Education
Description:
Covers school policies, exams, university initiatives, and education reforms.

Examples:
- University introduces AI-powered learning assistant.
- Board exams delayed due to nationwide protests.
- Government allocates funds for school renovation.
- Students protest against online exam policies.
- National literacy campaign launched in rural areas.`,

  `Category: Military
Description:
Includes defense strategies, armed conflicts, troop movements, and military budgets.

Examples:
- US conducts airstrikes in Syria after drone attack.
- Israel launches counter-offensive after rocket barrage.
- Defense Minister approves $10B arms deal.
- NATO strengthens Eastern European military presence.
- Warships conduct joint drills in disputed waters.`,

  `Category: Religion
Description:
Focuses on religious events, leaders, cultural practices, pilgrimages, and interfaith developments.

Examples:
- Pope visits war-torn region for peace mission.
- Hindu festival attracts millions in pilgrimage.
- Religious leaders speak out on social justice.
- Mosque vandalism sparks nationwide outrage.
- Vatican announces new canonization process reforms.`,

  `Category: Startup
Description:
Deals with early-stage companies, funding rounds, founders, and disruptive innovations.

Examples:
- Indian edtech startup raises $50M in Series B.
- AI-powered resume tool goes viral on LinkedIn.
- Founders of fintech startup featured in Forbes 30 Under 30.
- Climate-tech startup develops carbon-negative packaging.
- Healthtech startup partners with hospitals for diagnostics.`
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


const indexExists = async (indexName: string) => {
    try {
        const indexes = await pc.listIndexes();
        if (!indexes || !indexes.indexes) return false;
        for (const index of indexes.indexes) {
            if (index.name === indexName) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error(`Error checking ${indexName} index existence:`, error);
        throw error;
    }
};


const init = async (index_name: string, namespace_name: string) => {
    try {

        const exists = await indexExists(index_name);
        console.log(`Index ${index_name} exists: ${exists}`);
        if (!exists) {
            console.log(`Creating index: ${index_name}`);
            await pc.createIndexForModel({
                name: index_name,
                cloud: 'aws',
                region: 'us-east-1',
                embed: {
                    model: 'llama-text-embed-v2',
                    fieldMap: { text: 'chunk_text' },
                },
                waitUntilReady: true,
            });
            console.log(`Index ${index_name} created successfully`);
        } else {
            console.log(`Index ${index_name} already exists`);
        }

        const finalIndex = pc.index(index_name).namespace(namespace_name);
        if (index_name === PINECONE_CATEGORY_INDEX && !exists) {

            for (let i = 0; i < categoryDocs.length; i++) {
                const recordCategory = {
                    id: `${i + 1}`,
                    chunk_text: categoryDocs[i],
                    category: categoryNames[i],
                };

                await finalIndex.upsertRecords([recordCategory]);
            }
            return finalIndex;
        }
        else return finalIndex


    } catch (error) {
        console.error(`Failed to initialize Pinecone index ${index_name} :`, error);
        throw error;
    }
};


const indexPromise = init(PINECONE_INDEX_NAME, PINECONE_NAMESPACE);
const categoryIndexPromise = init(PINECONE_CATEGORY_INDEX, PINECONE_CATEGORY_NAMESPACE)

process.on('SIGINT', () => {
    console.log('Shutting down Pinecone client...');
    process.exit(0);
});

export { indexPromise as index, categoryIndexPromise as categoryIndex };