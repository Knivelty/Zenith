import { getSyncEntities } from "@dojoengine/state";
import * as torii from "@dojoengine/torii-client";
import {
    ClientComponents,
    createClientComponents,
} from "../createClientComponents";
import { createSystemCalls } from "../createSystemCalls";
import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { setupWorld } from "./generated";
import { DojoConfig, DojoProvider } from "@dojoengine/core";
import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    gql,
    split,
} from "@apollo/client/core";
import { createClient } from "graphql-ws";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";

import { Entity, setComponent } from "@dojoengine/recs";
import { getMainDefinition } from "@apollo/client/utilities";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup({ ...config }: DojoConfig) {
    // torii client
    const toriiClient = await torii.createClient([], {
        rpcUrl: config.rpcUrl,
        toriiUrl: config.toriiUrl,
        worldAddress: config.manifest.world.address || "",
    });

    // ws link
    const wsLink = new GraphQLWsLink(
        createClient({
            url: `${config.toriiUrl.replace(/^http:\/\//, "ws://")}/graphql/ws`,
        })
    );

    // http link
    const httpLink = new HttpLink({
        uri: `${config.toriiUrl}/graphql`,
    });

    // combine
    const link = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === "OperationDefinition" &&
                definition.operation === "subscription"
            );
        },
        wsLink,
        httpLink
    );

    const graphqlClient = new ApolloClient<any>({
        // uri: `${config.toriiUrl}/graphql`,
        link,
        // temp disable cache
        cache: new InMemoryCache(),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: "no-cache",
                errorPolicy: "ignore",
            },
            query: {
                fetchPolicy: "no-cache",
                errorPolicy: "all",
            },
        },
    });

    // create contract components
    const contractComponents = defineContractComponents(world);

    // create client components
    const clientComponents = createClientComponents({
        contractComponents,
        world,
    });

    // fetch all existing entities from torii
    await getSyncEntities(toriiClient, contractComponents as any);

    await syncCustomEvents(graphqlClient, clientComponents);

    // fetch custom event from graphql api

    const client = await setupWorld(
        new DojoProvider(config.manifest, config.rpcUrl)
    );

    return {
        client,
        clientComponents,
        contractComponents,
        systemCalls: createSystemCalls(
            { client },
            contractComponents,
            clientComponents
        ),
        config,
        graphqlClient,
    };
}

export type BattleLogsType = {
    inningBattleId: number;
    logs: string;
};

export type BattleLog = {
    player: string;
    order: number;
    pieceId: number;
    to_x: number;
    to_y: number;
    attackPieceId: number;
};

export const battleLogSubscription = gql`
    subscription ($keys: [String!]) {
        eventEmitted(keys: $keys) {
            data
            keys
        }
    }
`;

export type gqlRes = {
    eventEmitted: {
        data: string[];
    };
};

async function syncCustomEvents(
    graphqlClient: ApolloClient<any>,
    { BattleLogs }: ClientComponents
) {
    const subscription = graphqlClient.subscribe<gqlRes>({
        query: battleLogSubscription,
        variables: {
            // TODO: compute keys rather hard code
            keys: [
                "0x43387f82393e71c11fb2201d319a49b2456307dcab561e935754e2c7759096",
                "0x69004d77f08383338e5bd2af7cdf03669af92e195839a62598dcd58380076da",
            ],
        },
    });

    subscription.subscribe({
        next(v) {
            const data = v.data?.eventEmitted.data;

            if (!data) {
                return;
            }

            const output = [];

            const battleId = parseInt(data[0], 16);
            const length = parseInt(data[1], 16);

            for (let i = 0; i < length; i++) {
                output.push({
                    player: String(data[i * 6 + 2]),
                    order: parseInt(data[i * 6 + 3], 16),
                    pieceId: parseInt(data[i * 6 + 4]),
                    to_x: parseInt(data[i * 6 + 5]),
                    to_y: parseInt(data[i * 6 + 6]),
                    attackPieceId: parseInt(data[i * 6 + 7]),
                });
            }

            setComponent(BattleLogs, battleId.toString() as Entity, {
                inningBattleId: battleId,
                logs: JSON.stringify(output),
            });
        },
    });
}
