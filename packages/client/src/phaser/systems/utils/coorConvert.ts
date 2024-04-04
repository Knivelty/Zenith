import { TILE_HEIGHT, TILE_WIDTH } from "../../config/constants";

/**
 * @note the coord on chain start from 1, while the coord on phaser start from 0
 */
export function worldToChainCoord(
    worldX: number,
    worldY: number,
    isEnemy = false
) {
    const posX = Math.floor(worldX / TILE_WIDTH) + 1;
    const posY = isEnemy
        ? Math.floor(worldY / TILE_HEIGHT)
        : 8 - Math.floor(worldY / TILE_HEIGHT);

    return { posX, posY };
}

export function chainToWorldCoord(posX: number, posY: number, isEnemy = false) {
    const worldX = (posX - 1) * TILE_WIDTH;
    const worldY = isEnemy
        ? (posY - 1) * TILE_HEIGHT
        : (8 - posY) * TILE_HEIGHT;
    return { worldX, worldY };
}
