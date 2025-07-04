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
        score: Float!
        youtube: Boolean
        longDescription: String
        ytViews: Int
    }

    type News {
        childNews: [MiniNews]!
        id: ID!
        category: [String!]!
    }
`

