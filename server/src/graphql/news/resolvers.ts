import { NewsService } from "../../services/news"

const queries = {
    getNews: async () => {
        const allNews = await NewsService.getAllNews();
        return allNews
    },
    getNewsByCategory: async (_: any, { category }: { category: string }) => {
        const allNewsByCategory = await NewsService.getNewsByCategory(category);
        return allNewsByCategory;
    },
    getNewsOfSameParent: async (_: any, { parentNewsId }: { parentNewsId: string }) => {
        const newsOfSameParent = await NewsService.getNewsOfSameParent(parentNewsId)
        return newsOfSameParent;
    }
}

export const resolvers = { queries }