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
    calculateBattleLogs(pieces);
});

test("get target point", () => {
    const grid = new Grid(8, 8);

    grid.setWalkableAt(6, 6, false);

    getTargetPoint(grid, 1, 1, 7, 7, 2);
});
