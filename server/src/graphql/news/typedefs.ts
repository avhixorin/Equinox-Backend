export const typedefs = `#news
    type MiniNews {
        id: ID!
        title: String!
        content: String
        pubDate: String
        source: String
        imageUrl: String
        newsId: String!
        category: String!
    }

    type News {
        childNews: [MiniNews]!
        id: ID!

    }
`

