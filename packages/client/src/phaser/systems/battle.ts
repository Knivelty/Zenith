import {
    Entity,
    Has,
    UpdateType,
    defineSystem,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord, tween } from "@latticexyz/phaserx";
import { TILE_HEIGHT, TILE_WIDTH } from "../config/constants";
import { Sprite } from "@latticexyz/phaserx/src/types";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: { Piece, InningBattlePlay, InningBattle, Player },
            account,
        },
    } = layer;

    defineSystem(world, [Has(InningBattle)], ({ entity, type, value }) => {
        if (type == UpdateType.Enter && value) {
            setComponent(InningBattlePlay, entity, {
                shouldPlay: false,
                played: false,
            });
        }
    });

    defineSystem(world, [Has(InningBattlePlay)], ({ entity, type }) => {
        if (type == UpdateType.Update) {
            const play = getComponentValue(InningBattlePlay, entity);

            const pieceEntity = getEntityIdFromKeys([
                BigInt(account.address),
                1n,
            ]);

            const hero = objectPool.get(pieceEntity, "Sprite");

            if (play?.shouldPlay == true) {
                hero.setComponent({
                    id: pieceEntity,
                    now: async (sprite: Phaser.GameObjects.Sprite) => {
                        await tween(
                            {
                                targets: sprite,
                                duration: 1000,
                                props: { x: 250, y: 1000 },
                                ease: Phaser.Math.Easing.Linear,
                            },
                            { keepExistingTweens: true }
                        );

                        const entity = getEntityIdFromKeys([1n]);
                        updateComponent(InningBattlePlay, entity, {
                            shouldPlay: false,
                        });
                    },
                });
            }
        }
    });
};
