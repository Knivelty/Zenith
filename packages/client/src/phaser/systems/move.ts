import {
    Entity,
    Has,
    defineSystem,
    defineEnterSystem,
    getComponentValueStrict,
    UpdateType,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Sprites, TILE_HEIGHT, TILE_WIDTH } from "../config/constants";

export const move = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            components: { Piece, InningBattle },
        },
    } = layer;

    // defineEnterSystem(world, [Has(Piece)], ({ entity }: any) => {
    //     const playerObj = objectPool.get(entity.toString(), "Sprite");

    //     console.log(playerObj);

    //     playerObj.setComponent({
    //         id: "animation",
    //         once: (sprite: any) => {
    //             console.log(sprite);
    //             sprite.play(Animations.RockIdle);
    //         },
    //     });
    // });

    defineSystem(world, [Has(Piece)], ({ entity, type }) => {
        if (type === UpdateType.Enter) {
            console.log("entity: ", entity);
            const piece = getComponentValueStrict(
                Piece,
                entity.toString() as Entity
            );
            const offsetPosition = { x: piece.x_board, y: piece.y_board };
            const pixelPosition = tileCoordToPixelCoord(
                offsetPosition,
                TILE_WIDTH,
                TILE_HEIGHT
            );
            const hero = objectPool.get(entity, "Sprite");
            hero.setComponent({
                id: "piece",
                once: (sprite: Phaser.GameObjects.Sprite) => {
                    sprite.setPosition(pixelPosition?.x, pixelPosition?.y);

                    sprite.play(config.animations[piece.internal_index]);

                    // TODO: use lossless scale method
                    const scale = 32 / sprite.width;
                    sprite.setScale(scale);
                },
            });
        }
    });
};
