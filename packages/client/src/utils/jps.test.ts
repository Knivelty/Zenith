import { expect, test } from "vitest";
import { calculateBattleLogs, getTargetPoint } from "./jps";
import { Grid } from "pathfinding";

test("battle log", () => {
    const pieces = [
        {
            entity: "1",

            x: 1,
            y: 1,
            health: 600,
            attack: 60,
            armor: 20,
            speed: 3,
            range: 2,
            initiative: 40,
            isInHome: true,
            dead: false,
        },
        {
            entity: "2",
            x: 7,
            y: 7,
            health: 600,
            attack: 60,
            armor: 20,
            speed: 3,
            range: 2,
            initiative: 40,
            isInHome: false,
            dead: false,
        },
    ];
    const logs = calculateBattleLogs(pieces);
    // console.log("log: ", JSON.stringify(logs));
    expect(logs).to.be.toEqual({
        logs: [
            {
                entity: "1",
                paths: [
                    { x: 1, y: 1 },
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                    { x: 1, y: 4 },
                ],
                attackPiece: undefined,
            },
            {
                entity: "2",
                paths: [
                    { x: 7, y: 7 },
                    { x: 7, y: 6 },
                    { x: 6, y: 6 },
                    { x: 5, y: 6 },
                ],
                attackPiece: undefined,
            },
            {
                entity: "1",
                paths: [
                    { x: 1, y: 4 },
                    { x: 1, y: 5 },
                    { x: 1, y: 6 },
                    { x: 2, y: 6 },
                ],
                attackPiece: undefined,
            },
            {
                entity: "2",
                paths: [
                    { x: 5, y: 6 },
                    { x: 4, y: 6 },
                ],
                attackPiece: "1",
            },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
            { entity: "1", paths: [], attackPiece: "2" },
            { entity: "2", paths: [], attackPiece: "1" },
        ],
    });
});

test("get target point", () => {
    const grid = new Grid(8, 8);

    grid.setWalkableAt(6, 6, false);

    getTargetPoint(grid, 1, 1, 7, 7, 2);
});
