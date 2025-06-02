import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Userinfo as User } from "./user";
import { newsSubscription } from "./subscriptions";
import { NewsInfo } from "./news";

const typeDefs = `
    ${User.typeDefs}
    ${newsSubscription.typedefs}
    ${NewsInfo.typedefs}

    type Query {
        ${User.queries}
        ${NewsInfo.queries}
    }

    type Mutation {
        ${User.mutations}
        ${newsSubscription.mutations}
    }

`;

const resolvers = {
    Subscription: {
        ...newsSubscription.resolvers.Subscription
    },
    Query: {
        ...User.resolvers.queries,
        ...NewsInfo.resolvers.queries
    },
    Mutation: {
        ...User.resolvers.mutations,
        ...newsSubscription.resolvers.mutation
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
