import {
    Entity,
    getComponentValueStrict,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { PhaserLayer } from "../..";
import { TILE_WIDTH } from "../../config/constants";
import { chainToWorldCoord, worldToChainCoord } from "./coorConvert";
import { zeroEntity } from "../../../utils";
import { debug } from "../../../ui/lib/utils";

export const utils = (layer: PhaserLayer) => {
    const {
        game,
        scenes: {
            Main: { config, objectPool, input },
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
            },
            account,
        },
    } = layer;

    function removePieceOnBoard(gid: number) {
        const entity = getEntityIdFromKeys([BigInt(gid)]);

        const hero = objectPool.get(entity, "Sprite");

        console.warn(`removed piece, entity: ${entity} gid: ${gid}`);

        hero.despawn();
        // hero.setComponent({
        //     id: entity,
        //     now: (sprite: Phaser.GameObjects.Sprite) => {
        //         sprite.destroy();
        //     },
        // });

        // remove health bar
        setComponent(Health, `${entity}-health` as Entity, {
            pieceEntity: entity,
            max: 0,
            current: 0,
        });
    }

    function spawnPiece(playerAddr: bigint, index: bigint) {
        const playerPiece = getComponentValue(
            LocalPlayerPiece,
            getEntityIdFromKeys([playerAddr, index])
        );

        if (!playerPiece) {
            console.warn("no piece for ", playerAddr, index);
            return;
        }

        console.log("get piece", playerPiece);

        const entity = getEntityIdFromKeys([BigInt(playerPiece.gid)]);

        const piece = getComponentValueStrict(LocalPiece, entity);

        const isEnemy = BigInt(account.address) !== piece.owner;

        const { worldX, worldY } = chainToWorldCoord(piece.x, piece.y, isEnemy);

        console.log(
            `spawn ${playerAddr} ${index} ${piece.gid} at ${worldX}, ${worldY} `
        );

        const hero = objectPool.get(entity, "Sprite");
        hero.setComponent({
            id: entity,
            once: (sprite: Phaser.GameObjects.Sprite) => {
                sprite.setVisible(true);
                sprite.setPosition(worldX, worldY);
                sprite.play(config.animations[piece.creature_index]);
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
                        debug("drag end");
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
                            console.warn("pos occupied");
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

        // initialize health
        setComponent(Health, `${entity}-health` as Entity, {
            max: creature.health,
            current: creature.health,
            pieceEntity: entity,
        });
    }

    return { spawnPiece, removePieceOnBoard };
};
