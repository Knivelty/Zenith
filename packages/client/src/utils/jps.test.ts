import { expect, test } from "vitest";
import { PieceInBattle, calculateBattleLogs, getTargetPoint } from "./jps";
import { Grid } from "pathfinding";

test("battle log", () => {
    const pieces: PieceInBattle[] = [
        {
            player: "0x1",
            entity: "1",
            x: 1,
            y: 1,
            health: 600,
            attack: 60,
            armor: 20,
            speed: 3,
            range: 2,
            isInHome: true,
            dead: false,
        },
        {
            player: "0x2",
            entity: "2",
            x: 7,
            y: 7,
            health: 600,
            attack: 60,
            armor: 20,
            speed: 3,
            range: 2,
            isInHome: false,
            dead: false,
        },
    ];
    const logs = calculateBattleLogs(pieces);
    // console.log("log: ", JSON.stringify(logs));
    expect(logs).to.be.toEqual({
        logs: [
            {
                player: "0x1",
                entity: "1",

                order: 1,
                paths: [
                    { x: 1, y: 1 },
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                    { x: 1, y: 4 },
                ],
                attackPiece: undefined,
            },
            {
                player: "0x2",
                entity: "2",
                order: 2,

                paths: [
                    { x: 7, y: 7 },
                    { x: 7, y: 6 },
                    { x: 6, y: 6 },
                    { x: 5, y: 6 },
                ],
                attackPiece: undefined,
            },
            {
                player: "0x1",
                entity: "1",
                order: 3,

                paths: [
                    { x: 1, y: 4 },
                    { x: 1, y: 5 },
                    { x: 1, y: 6 },
                    { x: 2, y: 6 },
                ],
                attackPiece: undefined,
            },
            {
                player: "0x2",
                entity: "2",
                order: 4,
                paths: [
                    { x: 5, y: 6 },
                    { x: 4, y: 6 },
                ],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 5,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 6,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 7,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 8,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 9,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 10,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 11,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 12,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 13,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 14,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 15,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 16,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 17,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 18,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 19,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 20,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 21,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 22,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 23,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 24,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 25,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 26,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 27,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 28,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 29,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 30,
                paths: [],
                attackPiece: "1",
            },
            {
                player: "0x1",
                entity: "1",
                order: 31,
                paths: [],
                attackPiece: "2",
            },
            {
                player: "0x2",
                entity: "2",
                order: 32,
                paths: [],
                attackPiece: "1",
            },
        ],
    });
});

test("get target point", () => {
    const grid = new Grid(8, 8);

    grid.setWalkableAt(6, 6, false);

    getTargetPoint(grid, 1, 1, 7, 7, 2);
});
