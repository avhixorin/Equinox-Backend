export const queries = `
    getNews(query: String, lim: Int, offset: Int): [MiniNews]!
    getNewsByCategory(query:String, category: String!, lim:Int, offset:Int): [MiniNews]!
    getNewsOfSameParent(query:String, parentNewsId: String!, lim:Int, offset:Int): [MiniNews]!
`