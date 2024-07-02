import { TILE_HEIGHT, TILE_WIDTH } from "../../config/constants";

/**
 * @note the coord on chain start from 1, while the coord on phaser start from 0
 */
export function worldToChainCoord({
    worldX,
    worldY,
    isHome,
}: {
    worldX: number;
    worldY: number;
    isHome: boolean;
}) {
    const posX = Math.floor(worldX / TILE_WIDTH) + 1;
    const posY = isHome
        ? 8 - Math.floor(worldY / TILE_HEIGHT)
        : Math.floor(worldY / TILE_HEIGHT);

    return { posX, posY };
}

export function chainToSimulatorCoord({
    posX,
    posY,
    isHome,
}: {
    posX: number;
    posY: number;
    isHome: boolean;
}) {
    const simulatorX = posX - 1;
    const simulatorY = isHome ? 8 - posY : posY - 1;

    return { simulatorX, simulatorY };
}

export function simulatorToWorldCoord({
    posX,
    posY,
}: {
    posX: number;
    posY: number;
}) {
    const worldX = posX * TILE_WIDTH;
    const worldY = posY * TILE_HEIGHT;

    return { worldX, worldY };
}
