import { getSyncEntities } from "@dojoengine/state";
import * as torii from "@dojoengine/torii-client";
import { createClientComponents } from "../createClientComponents";
import { createSystemCalls } from "../createSystemCalls";
import { defineContractComponents } from "./typescript/models.gen";
import { world } from "./world";
import { setupWorld } from "./typescript/contracts.gen";
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
import { getMainDefinition } from "@apollo/client/utilities";
export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup({
    ...config
}: DojoConfig & { worldAddress: string; name: string | null }) {
    // torii client
    const toriiClient = await torii.createClient([], {
        rpcUrl: config.rpcUrl,
        toriiUrl: config.toriiUrl,
        relayUrl: config.relayUrl,
        worldAddress: config.worldAddress,
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
    // sync it asynchronously
    await getSyncEntities(toriiClient, contractComponents as any);

    // await syncCustomEvents(graphqlClient, clientComponents);

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
            clientComponents,
            clientComponents
        ),
        config,
        graphqlClient,
    };
}

// export type BattleLogsType = {
//     inningBattleId: number;
//     logs: string;
// };

// export type BattleLog = {
//     player: string;
//     pieceId: number;
//     entity: string;
//     order: number;
//     paths: { x: number; y: number }[];
//     attackPieceId: number;
// };

export const battleLogSubscription = gql`
    subscription ($keys: [String!]) {
        eventEmitted(keys: $keys) {
            data
            keys
        }
    }
`;

export const battleLogQuery = gql`
    query ($keys: [String!]) {
        events(keys: $keys) {
            edges {
                node {
                    id
                    keys
                    data
                }
            }
        }
    }
`;

export type gqlSubRes = {
    eventEmitted: {
        data: string[];
    };
};

export type gqlQueryRes = {
    events: {
        edges: { node: { id: string; keys: string[]; data: string[] } }[];
    };
};

// async function syncCustomEvents(
//     graphqlClient: ApolloClient<any>,
//     { BattleLogs }: ClientComponents
// ) {
// function syncEventToEntity(data: string[]) {
//     const output = new Array<BattleLog>();
//     const matchId = parseInt(data[0], 16);
//     const battleId = parseInt(data[1], 16);
//     const length = parseInt(data[2], 16);
//     // NOTE: include some hardcode, not generic for now
//     for (let i = 0; i < length; i++) {
//         const player = String(data[i * 6 + 3]);
//         const pieceId = parseInt(data[i * 6 + 5]);
//         const toX = parseInt(data[i * 6 + 6]);
//         const toY = parseInt(data[i * 6 + 7]);
//         const paths = new Array<Coord>();
//         if (i === 0 || i === 1) {
//             paths.push({ x: toX, y: toY });
//         } else {
//             paths.push({
//                 x: last(output[i - 2].paths)!.x,
//                 y: last(output[i - 2].paths)!.y,
//             });
//             paths.push({ x: toX, y: toY });
//         }
//         output.push({
//             player: player,
//             order: parseInt(data[i * 6 + 4], 16),
//             pieceId: pieceId,
//             entity: getEntityIdFromKeys([BigInt(player), BigInt(pieceId)]),
//             paths: paths,
//             attackPieceId: parseInt(data[i * 6 + 8]),
//         });
//     }
//     console.log(
//         "entity: ",
//         getEntityIdFromKeys([BigInt(matchId), BigInt(battleId)])
//     );
//     setComponent(
//         BattleLogs,
//         getEntityIdFromKeys([BigInt(matchId), BigInt(battleId)]),
//         {
//             matchId: matchId,
//             inningBattleId: battleId,
//             logs: JSON.stringify(output),
//         }
//     );
// }
// const fetched = graphqlClient.query<gqlQueryRes>({
//     query: battleLogQuery,
//     variables: {
//         // TODO: compute keys rather hard code
//         keys: [
//             "0x43387f82393e71c11fb2201d319a49b2456307dcab561e935754e2c7759096",
//             "0x69004d77f08383338e5bd2af7cdf03669af92e195839a62598dcd58380076da",
//         ],
//     },
// });
// fetched.then((result) => {
//     console.log("fetched result", result.data.events.edges);
//     result.data.events.edges.forEach((v) => {
//         console.log("v.node.data: ", v.node.data);
//         syncEventToEntity(v.node.data);
//     });
// });
// const subscription = graphqlClient.subscribe<gqlSubRes>({
//     query: battleLogSubscription,
//     variables: {
//         // TODO: compute keys rather hard code
//         keys: [
//             "0x43387f82393e71c11fb2201d319a49b2456307dcab561e935754e2c7759096",
//             "0x69004d77f08383338e5bd2af7cdf03669af92e195839a62598dcd58380076da",
//         ],
//     },
// });
// subscription.subscribe({
//     next(v) {
//         const data = v.data?.eventEmitted.data;
//         if (!data) {
//             return;
//         }
//         syncEventToEntity(data);
//     },
// });
// }
