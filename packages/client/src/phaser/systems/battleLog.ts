import { gql } from "@apollo/client/core";
import { PhaserLayer } from "..";
import {
    Entity,
    getComponentValue,
    getEntityComponents,
    getEntitySymbol,
} from "@dojoengine/recs";

const battleLogQuery = gql`
    query getEvents(
        $keys: [String!] # Write your query or mutation here
    ) {
        events(first: 34, keys: $keys) {
            totalCount
            edges {
                node {
                    id
                    keys
                    data
                    transactionHash
                }
            }
        }
    }
`;

export type gqlRes = {
    events: {
        totalCount: number;
        edges: [{ node: { id: string; keys: string[]; data: string[] } }];
    };
};

export async function battleLog(layer: PhaserLayer) {
    const {
        networkLayer: {
            network: { graphqlClient },
            components: { Player, Piece, Creature, InningBattle },
        },
    } = layer;

    const value = await graphqlClient.query<gqlRes>({
        query: battleLogQuery,
        variables: {
            // keep content fixed
            keys: [
                "0xf021f7b3de41d50b1ff43ee3cefbb306cadad75c4bb028d10c461bb1b8455b",
                "0x69004d77f08383338e5bd2af7cdf03669af92e195839a62598dcd58380076da",
            ],
        },
    });

    console.log("value: ", value);

    const logs = value.data.events.edges
        .map((v) => {
            return {
                player: v.node.data[0],
                pieceId: v.node.data[1],
                order: Number(v.node.data[2]),
                to_x: Number(v.node.data[3]),
                to_y: Number(v.node.data[4]),
                attackPieceId: v.node.data[5],
            };
        })
        .sort((a, b) => Number(a.order > b.order));

    // get player address
    const inningBattle = getComponentValue(
        InningBattle,
        "0x579e8877c7755365d5ec1ec7d3a94a457eff5d1f40482bbe9729c064cdead2" as Entity
    );

    // handle game progress
    // logs.reduce((acc, cur, index,) => {
    //     return {
    //         turn: index + 1,
    //         pieces: [{ id: 1, owner: true, hp: 300, x: 1, y: 1 }],
    //     };
    // });

    return [
        {
            turn: 1,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 1, y: 1 },
                { id: 2, owner: false, hp: 300, x: 7, y: 7 },
            ],
        },
        {
            turn: 2,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 5, y: 1 },
                { id: 2, owner: false, hp: 300, x: 7, y: 7 },
            ],
        },
        {
            turn: 3,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 5, y: 1 },
                { id: 2, owner: false, hp: 300, x: 5, y: 2 },
            ],
        },
        {
            turn: 4,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 300, x: 5, y: 4 },
                { id: 2, owner: false, hp: 250, x: 5, y: 2 },
            ],
        },
        {
            turn: 5,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 250, x: 5, y: 4 },
                { id: 2, owner: false, hp: 250, x: 5, y: 2 },
            ],
        },
        {
            turn: 6,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 250, x: 5, y: 4 },
                { id: 2, owner: false, hp: 200, x: 5, y: 2 },
            ],
        },
        {
            turn: 7,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 200, x: 5, y: 4 },
                { id: 2, owner: false, hp: 200, x: 5, y: 2 },
            ],
        },
        {
            turn: 8,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 200, x: 5, y: 4 },
                { id: 2, owner: false, hp: 150, x: 5, y: 2 },
            ],
        },
        {
            turn: 9,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 150, x: 5, y: 4 },
                { id: 2, owner: false, hp: 150, x: 5, y: 2 },
            ],
        },
        {
            turn: 10,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 150, x: 5, y: 4 },
                { id: 2, owner: false, hp: 100, x: 5, y: 2 },
            ],
        },
        {
            turn: 11,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 100, x: 5, y: 4 },
                { id: 2, owner: false, hp: 100, x: 5, y: 2 },
            ],
        },
        {
            turn: 12,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 100, x: 5, y: 4 },
                { id: 2, owner: false, hp: 50, x: 5, y: 2 },
            ],
        },
        {
            turn: 13,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 50, x: 5, y: 4 },
                { id: 2, owner: false, hp: 50, x: 5, y: 2 },
            ],
        },
        {
            turn: 14,
            round: 1,
            monster: [
                { id: 1, owner: true, hp: 50, x: 5, y: 4 },
                { id: 2, owner: false, hp: 0, x: 5, y: 2 },
            ],
        },
    ];
}
