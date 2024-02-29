import {
    Entity,
    Has,
    defineSystem,
    getComponentValueStrict,
    UpdateType,
    getComponentValue,
    setComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { TILE_HEIGHT, TILE_WIDTH } from "../config/constants";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
import { GameStatusEnum } from "../../dojo/types";

export const prepare = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Player,
                Piece,
                InningBattle,
                GameStatus,
                HealthBar,
            },
            account,
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

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if switch to prepare, recover all piece to initial place
            console.log("v: ", v);
            if (v?.status === GameStatusEnum.Prepare) {
                //
                const player = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([BigInt(account.address)])
                );

                console.log("count: ", player.heroesCount);

                // spawn local players piece
                for (let i = 1; i <= player.heroesCount; i++) {
                    spawnPreparedPiece(
                        getEntityIdFromKeys([
                            BigInt(account.address),
                            BigInt(i),
                        ])
                    );
                }

                // spawn enemy's piece
                const inningBattle = getComponentValueStrict(
                    InningBattle,
                    getEntityIdFromKeys([BigInt(v.currentRound)])
                );

                const enemy = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([inningBattle.awayPlayer])
                );

                // spawn local players piece
                for (let i = 1; i <= enemy.heroesCount; i++) {
                    spawnPreparedPiece(
                        getEntityIdFromKeys([
                            inningBattle.awayPlayer,
                            BigInt(i),
                        ])
                    );
                }
            }
        }
    );

    function spawnPreparedPiece(entity: Entity) {
        const piece = getComponentValueStrict(
            Piece,
            entity.toString() as Entity
        );

        let offsetPosition = { x: piece.x_board, y: piece.y_board };

        if (BigInt(account.address) !== piece.owner) {
            console.log("offsetPosition: ", offsetPosition);
            offsetPosition = {
                x: 8 - offsetPosition.x,
                y: 8 - offsetPosition.x,
            };
            console.log("offsetPosition: ", offsetPosition);
        }

        const pixelPosition = tileCoordToPixelCoord(
            offsetPosition,
            TILE_WIDTH,
            TILE_HEIGHT
        );
        const hero = objectPool.get(entity, "Sprite");

        hero.setComponent({
            id: entity,
            once: (sprite: Phaser.GameObjects.Sprite) => {
                console.log("pixelPosition: ", pixelPosition);
                sprite.setPosition(pixelPosition?.x, pixelPosition?.y);

                sprite.play(config.animations[piece.internal_index]);

                // TODO: use lossless scale method
                const scale = TILE_WIDTH / sprite.width;
                sprite.setScale(scale);
            },
        });

        // update health bar
        setComponent(HealthBar, `${entity}-health` as Entity, {
            x: pixelPosition.x,
            y: pixelPosition.y,
        });
    }

    defineSystem(world, [Has(Piece)], ({ entity, type }) => {
        const gameStatus = getComponentValue(GameStatus, zeroEntity);

        if (!gameStatus) {
            return;
        }

        if (
            type === UpdateType.Enter &&
            gameStatus.status === GameStatusEnum.Prepare
        ) {
            spawnPreparedPiece(entity as Entity);
        }
    });
};
