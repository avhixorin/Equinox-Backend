import { PrismaClient } from "@prisma/client";
import { createObjectCsvWriter } from "csv-writer"
const client = new PrismaClient();

const csvWriter = createObjectCsvWriter({
    path: './news.csv',
    header: [
        { id: 'id', title: 'Id' },
        { id: 'link', title: 'Link' },
        { id: 'title', title: 'Title' },
        { id: 'fullNews', title: 'FullNews' }
    ],
    alwaysQuote: true,
});

export async function getDataForCSV() {
    const news = await client.miniNews.findMany({
        select: {
            id: true,
            link: true,
            title: true,
            longDescription: true
        }
    })

    const records = news.map(item => ({
        id: item.id,
        link: item.link,
        title: item.title,
        fullNews: item.longDescription
            ?.replace(/\u2028|\u2029/g, ' ')
            ?.replace(/\r?\n/g, ' ')
            ?.replace(/\s{2,}/g, ' ')
            ?.trim()
    }));

    await csvWriter.writeRecords(records)
    console.log(`✅ CSV file created with ${records.length} records.`);

}

getDataForCSV()