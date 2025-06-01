import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import { useServer } from 'graphql-ws/lib/use/ws';
import { expressMiddleware } from "@as-integrations/express5";
import { createApolloGraphqlServer, schema } from "./graphql"; // 
import { UserService } from "./services/user";

async function init() {
    const app = express();
    const PORT = process.env.PORT || 4000;

    app.use(cors({
        origin: ['*'],
        methods: ['GET', 'POST'],
        credentials: true,
    }));

    app.use(express.json());


    const gqlServer = await createApolloGraphqlServer();

    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: "/graphql",
    });

    useServer(
        {
            schema,
            onConnect: () => {
                console.log('WebSocket connection established');
            },
            onDisconnect: () => {
                console.log('WebSocket connection closed');
            },
            onError: (error: any) => {
                console.error('WebSocket error:', error);
            },
        },
        wsServer
    );

    app.get("/", (req, res) => res.send("Server is healthy"));


    app.use(
        "/graphql",
        expressMiddleware(gqlServer, {
            context: async ({ req }: { req: any }) => {
                try {
                    const token = req.headers["authorization"];
                    if (!token) throw new Error("Invalid token");
                    return { user: UserService.decodeJwtToken(token) };
                } catch {
                    throw new Error("Authentication failed");
                }
            },
        })
    );

    httpServer.listen(PORT, () => {
        console.log(`Query/Mutation ready at http://localhost:${PORT}/graphql`);
        console.log(`Subscription: ws://localhost:${PORT}/graphql`);
    });
}

init();