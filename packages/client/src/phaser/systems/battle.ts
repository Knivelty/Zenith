import {
    Entity,
    Has,
    UpdateType,
    defineSystem,
    getComponentValueStrict,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { TILE_HEIGHT, TILE_WIDTH } from "../config/constants";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            contractComponents: { Piece, InningBattle, Player },
            account,
        },
    } = layer;

    defineSystem(world, [Has(InningBattle)], ({ entity, type }) => {
        if (type == UpdateType.Enter) {
            // mock move start

            // get player piece
            const piece1 = getComponentValueStrict(
                Piece,
                account.address as Entity
            );
        }
    });
};
