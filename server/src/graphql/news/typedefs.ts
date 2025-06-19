export const typedefs = `#news
    type MiniNews {
        id: ID!
        link: String!
        title: String!
        content: String
        pubDate: String
        source: String
        imageUrl: String
        newsId: String!
        category: [String!]!
        isBookmarked: Boolean
    }

    type News {
        childNews: [MiniNews]!
        id: ID!
        category: [String!]!
    }
`

