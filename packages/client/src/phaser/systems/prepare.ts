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
                Health,
                Creature,
            },
            account,
        },
    } = layer;

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if switch to prepare, recover all piece to initial place
            if (v?.status === GameStatusEnum.Prepare) {
                //
                const player = getComponentValueStrict(
                    Player,
                    getEntityIdFromKeys([BigInt(account.address)])
                );

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

        let piecePosition = { x: piece.x_board, y: piece.y_board };

        if (BigInt(account.address) !== piece.owner) {
            piecePosition = {
                x: 8 - piecePosition.x,
                y: 8 - piecePosition.x,
            };
        }

        const pixelPosition = tileCoordToPixelCoord(
            piecePosition,
            TILE_WIDTH,
            TILE_HEIGHT
        );

        const hero = objectPool.get(entity, "Sprite");

        hero.setComponent({
            id: entity,
            now: (sprite: Phaser.GameObjects.Sprite) => {
                sprite.setPosition(pixelPosition.x, pixelPosition.y);

                sprite.play(config.animations[piece.internal_index]);

                // TODO: use lossless scale method
                const scale = TILE_WIDTH / sprite.width;
                sprite.setScale(scale);
            },
        });

        // initialize health bar
        setComponent(HealthBar, `${entity}-health-bar` as Entity, {
            x: pixelPosition.x,
            y: pixelPosition.y,
            percentage: 100,
        });

        const creature = getComponentValueStrict(
            Creature,
            getEntityIdFromKeys([BigInt(piece.internal_index)])
        );

        // initialize health
        setComponent(Health, `${entity}-health` as Entity, {
            max: creature.health * piece.tier,
            current: creature.health * piece.tier,
            pieceEntity: entity,
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
