import { Article } from "../constant.js";
import { PrismaClient } from "@prisma/client";
import { setLongDescription } from "./updateLongDescription.js";

const prisma = new PrismaClient();

export const handleNewArticle = async (article: Article, categories: string[]) => {
    const consoleError = console.error;
    console.error = () => { }
    try {
        const news = await prisma.news.create({
            data: { category: categories }
        });

        const miniNews = await prisma.miniNews.create({
            data: {
                title: article.title,
                content: article.content,
                link: article.link,
                source: article.source,
                pubDate: article.pubDate,
                imageUrl: article.imageUrl,
                newsId: news.id,
                category: categories,
                score: 1.2,
                youtube: article.youtube || false,
                ytViews: article.views || 0
            }
        });


        await setLongDescription({ id: miniNews.id, link: miniNews.link });
    } catch (error) {
        console.error("Error stroing this article in db:", error);
    }
    finally {
        console.error = consoleError;
    }

}
export const handleRelatedArticle = async (
    article: Article, categories: string[],
    relatedLink: string, relatedScore: number) => {

    const consoleError = console.error;
    console.error = () => { }

    const relevantArticle = await prisma.miniNews.findFirst({
        where: { link: relatedLink },
        include: { news: true }
    });
    if (!relevantArticle) {
        console.warn("Related article not found in DB, skipping child creation.");
        return;
    }

    const oldCategories = relevantArticle?.news.category || [];

    if (oldCategories[0] !== "Others" && categories[0] !== "Others") {
        const newCategories = [...new Set([...oldCategories, ...categories])];

        console.log("Updating existing article with new categories:", newCategories);

        await prisma.news.update({
            where: { id: relevantArticle?.newsId },
            data: {
                category: newCategories,
            }
        });
    }

    try {
        const miniNews = await prisma.miniNews.create({
            data: {
                title: article.title,
                content: article.content,
                link: article.link,
                source: article.source,
                pubDate: article.pubDate,
                imageUrl: article.imageUrl,
                newsId: relevantArticle.newsId,
                category: categories,
                score: relatedScore.toFixed(2),
                youtube: article.youtube || false,
                ytViews: article.views || 0
            }
        });
        await setLongDescription({ id: miniNews.id, link: miniNews.link });
    } catch (error) {
        console.log("Error stroing this article in db:", error);
    }

    console.error = consoleError;
}











