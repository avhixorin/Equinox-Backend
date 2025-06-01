export const typedefs = `#subscriptions
    type Subscription {
        newlyAddedNews: String!
    }
    type MiniNews {
        id: ID!
        title: String!
        content: String
        pubDate: String
        source: String
        imageUrl: String
        newsId: String!
        news: News
    }

    type News {
        category: String!
        childNews: [MiniNews]!
        id: ID!

    }
`

