import { prismaClient } from "../lib/db";
import { contextMiddleware } from "./user";

export class NewsService {

    public static async getAllNews(context: any, query: string, limit: number, offset: number) {
        let id = null;
        try {
            const { id: userid } = contextMiddleware(context);
            id = userid;
        } catch (error) {
            console.log("fetching news without logging in!")
        }

        let initialNews = null;
        console.log("inside get allnews")
        if (query?.trim() === "") {
            console.log("offset:", offset, "limit:", limit)
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

            console.log("initialNews length:", initialNews.length)

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
        if (id) {
            const userBookmarkedData = await prismaClient.bookmark.findMany({
                where: { userId: id }
            })
            initialNews = (initialNews as { id: string }[]).map((news: { id: string }) => {
                const isBookmarked = userBookmarkedData.some((bookmark: { miniNewsId: string }) => bookmark.miniNewsId === news.id);
                return {
                    ...news,
                    isBookmarked
                }
            })

        }
        const grouped = new Map();

        return initialNews

    }

    public static async getSpecificNews(context: any, timestampInSeconds: String, category: string) {
        console.log("timestampInSeconds:", timestampInSeconds, "category:", category);
        const date = new Date(+timestampInSeconds); 

        // Get start and end of the same day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const news = await prismaClient.miniNews.findMany({
            where: {
                pubDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                category: {
                    has: category
                }
            },
            orderBy: {
                pubDate: 'desc'
            }
        });

        console.log("Matching news count:", news.length);
        return news;

    }

    public static async getNewsByCategory(context: any, query: string, category: string, limit: number, offset: number) {

        let initialNews = null;
        let id = null;
        try {
            const { id: userid } = contextMiddleware(context);
            id = userid;
        } catch (error) {
            console.log("fetching news without logging in!")
        }
        if (query?.trim() === "") {
            initialNews = await prismaClient.miniNews.findMany({
                orderBy: {
                    pubDate: 'desc',
                },
                where: {
                    category: {
                        has: category
                    }
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
        return initialNews;
    }



    public static async getNewsOfSameParent(context: any, query: string, parentNewsId: string, limit: number, offset: number) {

        let initialNews = null;
        let id = null;
        try {
            const { id: userid } = contextMiddleware(context);
            id = userid;
        } catch (error) {
            console.log("fetching news without logging in!")
        }

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
        return initialNews;
    }



}
