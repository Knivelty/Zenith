import {
    Entity,
    getComponentValueStrict,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { PhaserLayer } from "../..";
import { AnimationIndex, TILE_WIDTH } from "../../config/constants";
import { chainToWorldCoord, worldToChainCoord } from "./coorConvert";
import { zeroEntity } from "../../../utils";
import { isEqual } from "lodash";
import { logDebug } from "../../../ui/lib/utils";

export const pieceManage = (layer: PhaserLayer) => {
    const {
        game,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                HealthBar,
                Health,
                CreatureProfile,
                LocalPlayerPiece,
                LocalPiece,
                LocalPieceOccupation,
                UserOperation,
                GameStatus,
            },
            account,
        },
    } = layer;

    function removePieceOnBoard(gid: number) {
        const entity = getEntityIdFromKeys([BigInt(gid)]);

        const hero = objectPool.get(entity, "Sprite");

        if (isEqual(hero.position, { x: 0, y: 0 })) {
            return;
        }
        logDebug(`removed piece, entity: ${entity} gid: ${gid}`);

        hero.despawn();
        // hero.setComponent({
        //     id: entity,
        //     now: (sprite: Phaser.GameObjects.Sprite) => {
        //         sprite.destroy();
        //     },
        // });

        // remove health bar
        updateComponent(Health, `${entity}-health` as Entity, {
            pieceEntity: entity,
            max: 0,
            current: 0,
        });
    }

    /**
     *
     * @param playerAddr
     * @param index
     * @param override whether to override previous one
     * @returns
     */
    function spawnPiece(
        playerAddr: bigint,
        index: bigint,
        override = false,
        pieceGid = 0
    ) {
        const playerPiece = getComponentValue(
            LocalPlayerPiece,
            getEntityIdFromKeys([playerAddr, index])
        );

        const status = getComponentValueStrict(GameStatus, zeroEntity);

        pieceGid = playerPiece?.gid || pieceGid;

        if (!playerPiece && pieceGid === 0) {
            logDebug("no piece for ", playerAddr, index);
            return;
        }

        const entity = getEntityIdFromKeys([BigInt(pieceGid)]);

        logDebug(`try get piece ${playerAddr} ${index} ${pieceGid}`);
        const piece = getComponentValue(LocalPiece, entity);
        if (!piece) {
            throw Error(`try get piece ${playerAddr} ${index} ${pieceGid}`);
        }

        const isEnemy = BigInt(account.address) !== piece.owner;

        const { worldX, worldY } = chainToWorldCoord(piece.x, piece.y, isEnemy);

        logDebug(
            `spawn ${playerAddr} ${index} ${piece.gid} at ${worldX}, ${worldY} `
        );

        const hero = objectPool.get(entity, "Sprite");

        if (!override && !isEqual(hero.position, { x: 0, y: 0 })) {
            logDebug(`piece ${pieceGid} already spawned`);
            return;
        }

        hero.setComponent({
            id: entity,
            once: (sprite: Phaser.GameObjects.Sprite) => {
                sprite.setVisible(true);
                sprite.setPosition(worldX, worldY);
                sprite.play(
                    config.animations[AnimationIndex[piece.creature_index]]
                );
                sprite.setInteractive();

                // TODO: use lossless scale method
                const scale = TILE_WIDTH / sprite.width;
                sprite.setScale(scale);

                // set tint for enemy
                if (isEnemy) {
                    sprite.setTintFill(0xff4e4e);
                }

                // set draggable for self piece
                if (!isEnemy) {
                    game.scene.getScene("Main")?.input.setDraggable(sprite);

                    sprite.off("dragstart");
                    sprite.on("dragstart", () => {
                        sprite.setTint(0x50dfb6);

                        // set dragging to true
                        setComponent(UserOperation, zeroEntity, {
                            dragging: true,
                            gid: piece.gid,
                        });
                    });

                    sprite.off("drag");
                    sprite.on(
                        "drag",
                        (
                            p: Phaser.Input.Pointer,
                            gameObj: Phaser.GameObjects.GameObject
                        ) => {}
                    );

                    sprite.off("dragend");
                    sprite.on("dragend", (p: Phaser.Input.Pointer) => {
                        logDebug("drag end");
                        sprite.clearTint(); // clear tint color

                        // set dragging to false
                        setComponent(UserOperation, zeroEntity, {
                            dragging: false,
                            gid: 0,
                        });

                        const { posX, posY } = worldToChainCoord(
                            p.worldX,
                            p.worldY
                        );
                        if (posY > 4 || posY < 1 || posX < 1 || posX > 8) {
                            console.warn("invalid dst");
                            return;
                        }

                        // check whether is occupied

                        const occupiedEntity = getEntityIdFromKeys([
                            BigInt(posX),
                            BigInt(posY),
                        ]);

                        const pieceOccu = getComponentValue(
                            LocalPieceOccupation,
                            occupiedEntity
                        );

                        if (pieceOccu?.occupied) {
                            logDebug(`pos ${posX}, ${posY} occupied`);
                            return;
                        }

                        updateComponent(LocalPiece, entity, {
                            x: posX,
                            y: posY,
                        });
                    });
                }
            },
        });

        // initialize health bar
        setComponent(HealthBar, `${entity}-health-bar` as Entity, {
            x: worldX,
            y: worldY,
            percentage: 100,
            isPlayer: !isEnemy,
        });

        const creature = getComponentValueStrict(
            CreatureProfile,
            getEntityIdFromKeys([
                BigInt(piece.creature_index),
                BigInt(piece.level),
            ])
        );

        //health boost here
        const dangerous = status.dangerous;
        const boost = dangerous && isEnemy ? 1.2 : 1;

        // initialize health
        setComponent(Health, `${entity}-health` as Entity, {
            max: creature.health * boost,
            current: creature.health * boost,
            pieceEntity: entity,
        });
    }

    return { spawnPiece, removePieceOnBoard };
};
