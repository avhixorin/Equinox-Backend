import { ApolloServer } from "@apollo/server";
import { GraphQLJSONObject } from 'graphql-type-json';
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Userinfo as User } from "./user";
import { newsSubscription } from "./subscriptions";
import { NewsInfo } from "./news";
import { BookmarkInfo } from "./bookmark";
import { timelineInfo } from "./timeline";

const typeDefs = `
    ${User.typeDefs}
    ${newsSubscription.typedefs}
    ${NewsInfo.typedefs}
    ${timelineInfo.typeDefs}

    type Query {
        ${User.queries}
        ${NewsInfo.queries}
        ${BookmarkInfo.queries}
        ${timelineInfo.queries}
    }

    type Mutation {
        ${User.mutations}
        ${newsSubscription.mutations}
        ${BookmarkInfo.mutations}
    }

`;

const resolvers = {
    JSON: GraphQLJSONObject,
    Subscription: {
        ...newsSubscription.resolvers.Subscription
    },
    Query: {
        ...User.resolvers.queries,
        ...NewsInfo.resolvers.queries,
        ...BookmarkInfo.resolvers.queries,
        ...timelineInfo.resolvers.queries
    },
    Mutation: {
        ...User.resolvers.mutations,
        ...newsSubscription.resolvers.mutation,
        ...BookmarkInfo.resolvers.mutations
    }
};



export const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

export async function createApolloGraphqlServer() {
    const server = new ApolloServer({
        schema,
        introspection: true,
    });

    await server.start();
    return server;
}
