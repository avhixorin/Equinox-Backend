import { prismaClient } from "../lib/db";

export class NewsService {

    public static async getAllNews(query: string, limit: number, offset: number) {

        if (query?.trim() === "") {
            return await prismaClient.miniNews.findMany({
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

        const result = await prismaClient.$queryRawUnsafe(
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
        return result;
    }


    public static async getNewsByCategory(query: string, category: string, limit: number, offset: number) {

        if (query?.trim() === "") {
            return await prismaClient.miniNews.findMany({
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
        const result = await prismaClient.$queryRawUnsafe(
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
        return result;
    }



    public static async getNewsOfSameParent(query: string, parentNewsId: string, limit: number, offset: number) {


        if (query?.trim() === "") {
            return await prismaClient.miniNews.findMany({
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

        const result = await prismaClient.$queryRawUnsafe(
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
        return result;
    }



}
