import { ApolloServer } from "@apollo/server";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Userinfo as User } from "./user";
import { newsSubscription } from "./subscriptions";

const typeDefs = `
    ${User.typeDefs}
    ${newsSubscription.typedefs}

    type Query {
        ${User.queries}
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
        ...User.resolvers.queries
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
