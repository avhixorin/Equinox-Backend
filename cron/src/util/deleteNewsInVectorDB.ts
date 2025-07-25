import { indexPromise } from "./createVectorDbIndex.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function deleteNewsInVectorDB() {
    const index = await indexPromise;
    const vectorArray = [];
    let nextToken: string | null = null;

    interface ListPaginatedResult {
        vectors?: any[];
        pagination?: {
            next?: string;
        };
    }

    while (true) {
        const result: ListPaginatedResult = !nextToken
            ? await index.listPaginated()
            : await index.listPaginated({ paginationToken: nextToken });
        if (result.vectors) {
            vectorArray.push(...result.vectors);
        }
        if (result.pagination?.next) {
            nextToken = result.pagination.next;
        }
        else break;
    }

    console.log(vectorArray.length)
    const idArr = vectorArray.map(item => item.id);

    const existingNews = await prisma.miniNews.findMany({
        where: {
            id: {
                in: idArr
            }
        },
        select: {
            id: true
        }
    })

    const existingIdSet = new Set(existingNews.map(item => item.id));

    const staleNewsId = idArr.filter(id => !existingIdSet.has(id))
    console.log("stale news cnt: ", staleNewsId.length)
    if(staleNewsId.length === 0){
        console.log("no stale news found")
        return;
    }
    await index.deleteMany(staleNewsId);
    console.log(`✅ ${staleNewsId.length} stale vectors deleted from Pinecone`);
}

try {
    await deleteNewsInVectorDB();
} catch (err) {
    console.error("Error deleting vectors:", err);
} finally {
    await prisma.$disconnect();
}
