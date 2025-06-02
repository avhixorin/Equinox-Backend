export const queries = `
    getNews: [MiniNews]!
    getNewsByCategory(category: String!): [MiniNews]!
    getNewsOfSameParent(parentNewsId: String!): [MiniNews]!
`