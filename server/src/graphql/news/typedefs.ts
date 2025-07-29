export const typedefs = `#news
    type MiniNews {
        id: ID!
        links: [String!]!
        title: String!
        content: String
        pubDate: String
        sources: [String!]!
        imageUrl: String
        newsId: String!
        category: String
        isBookmarked: Boolean
        score: Float!
        youtube: Boolean
        ytViews: Int

        center: Float!
        center_left: Float!
        center_right: Float!
        far_left: Float!
        right: Float!
        confidence: Float!
        contextsummary: String
        predictedbias: String
    }

    type News {
        childNews: [MiniNews!]!
        id: ID!
    }
`
