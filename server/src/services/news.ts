// getNews: [MiniNews]!
// getNewsByCategory(category: String!): [MiniNews]!
// getNewsOfSameParent(parentNewsId: String!): [MiniNews]!

import { prismaClient } from "../lib/db";

export class NewsService {

    public static async getAllNews() {
        const allNews = await prismaClient.miniNews.findMany({});
        return allNews;
    }

    public static async getNewsByCategory(category: string) {
        const newsByCategory = await prismaClient.miniNews.findMany({
            where: {
                category
            }
        })
        return newsByCategory
    }

    public static async getNewsOfSameParent(parentNewsId: string) {
        const news = await prismaClient.miniNews.findMany({
            where: {
                newsId: parentNewsId
            },
        })
        return news;
    }

}
