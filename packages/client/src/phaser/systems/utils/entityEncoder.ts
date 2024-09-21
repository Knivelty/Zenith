import { Entity } from "@dojoengine/recs";

export function encodeGroundEntity(x: number, y: number) {
    const groundSpriteEntity = `ground-${x}-${y}`;

    return groundSpriteEntity;
}

export function encodeRandomGroundEntity(x: number, y: number) {
    const r = (Math.random() * 1000).toPrecision(3);
    const groundSpriteEntity = `ground-${x}-${y}-${r}`;

    return groundSpriteEntity;
}

export function encodeEntityStatusBarEntity(pieceEntity: string) {
    return `${pieceEntity}-status-bar` as Entity;
}
