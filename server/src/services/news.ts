import { prismaClient } from "../lib/db";

export class NewsService {

    public static async getAllNews(query: string, limit: number, offset: number) {

        let initialNews = null;
        console.log("inside get allnews")
        if (query?.trim() === "") {
            initialNews = await prismaClient.miniNews.findMany({
                orderBy: {
                    pubDate: 'desc',
                },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    category: true,
                    newsId: true,
                    pubDate: true,
                    link: true,
                    source: true,
                    imageUrl: true,
                }
            });

        }
        else {
            initialNews = await prismaClient.$queryRawUnsafe(
                `
        SELECT id, title, content, category, "newsId", "pubDate", link, source, "imageUrl"
        FROM "MiniNews"
        WHERE search_vector @@ plainto_tsquery('english', $1)
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
        LIMIT $2 OFFSET $3;
        `,
                query,
                limit,
                offset
            );
        }

        if (!initialNews) throw new Error("error in fetching news!")
        const grouped = new Map();

        for (const item of initialNews as { newsId: string, pubDate: Date, source: string }[]) {
            const date = new Date(item.pubDate);
            const dateOnly = date.toISOString().split("T")[0];
            const key = `${item.newsId}-${dateOnly}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            const group = grouped.get(key);
            const alreadyExists = group.some((news: { source: string }) => news.source === item.source);
            if (!alreadyExists) {
                group.push(item);
            }
        }

        const finalNews = Array.from(grouped.values());

        return finalNews;


    }


    public static async getNewsByCategory(query: string, category: string, limit: number, offset: number) {

        let initialNews = null;
        if (query?.trim() === "") {
            initialNews = await prismaClient.miniNews.findMany({
                orderBy: {
                    pubDate: 'desc',
                },
                where: {
                    category
                },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    category: true,
                    newsId: true,
                    pubDate: true,
                    link: true,
                    source: true,
                    imageUrl: true,
                }
            });
        }
        else {
            initialNews = await prismaClient.$queryRawUnsafe(
                `
        SELECT id, title, content, category, "newsId", "pubDate", link, source, "imageUrl"
        FROM "MiniNews"
        WHERE category = $2
          AND search_vector @@ plainto_tsquery('english', $1)
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
        LIMIT $3 OFFSET $4;
        `,
                query,
                category,
                limit,
                offset
            );
        }

        if (!initialNews) throw new Error("error in fetching news!")
        const grouped = new Map();

        for (const item of initialNews as { newsId: string, pubDate: Date, source: string }[]) {
            const date = new Date(item.pubDate);
            const dateOnly = date.toISOString().split("T")[0];
            const key = `${item.newsId}-${dateOnly}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            const group = grouped.get(key);
            const alreadyExists = group.some((news: { source: string }) => news.source === item.source);
            if (!alreadyExists) {
                group.push(item);
            }
        }

        const finalNews = Array.from(grouped.values());

        return finalNews;
    }



    public static async getNewsOfSameParent(query: string, parentNewsId: string, limit: number, offset: number) {

        let initialNews = null;

        if (query?.trim() === "") {
            initialNews = await prismaClient.miniNews.findMany({
                orderBy: {
                    pubDate: 'desc',
                },
                where: {
                    newsId: parentNewsId
                },
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    category: true,
                    newsId: true,
                    pubDate: true,
                    link: true,
                    source: true,
                    imageUrl: true,
                }
            });
        }
        else {
            initialNews = await prismaClient.$queryRawUnsafe(
                `
        SELECT id, title, content, category, "newsId", "pubDate", link, source, "imageUrl"
        FROM "MiniNews"
        WHERE "newsId" = $2
          AND search_vector @@ plainto_tsquery('english', $1)
        ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC
        LIMIT $3 OFFSET $4;
        `,
                query,
                parentNewsId,
                limit,
                offset
            );
        }

        if (!initialNews) throw new Error("error in fetching news!")
        const grouped = new Map();

        for (const item of initialNews as { newsId: string, pubDate: Date, source: string }[]) {
            const date = new Date(item.pubDate);
            const dateOnly = date.toISOString().split("T")[0];
            const key = `${item.newsId}-${dateOnly}`;
            if (!grouped.has(key)) {
                grouped.set(key, []);
            }
            const group = grouped.get(key);
            const alreadyExists = group.some((news: { source: string }) => news.source === item.source);
            if (!alreadyExists) {
                group.push(item);
            }
        }

        const finalNews = Array.from(grouped.values());

        return finalNews;
    }



}
