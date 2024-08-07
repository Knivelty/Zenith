import {
    Entity,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { PhaserLayer } from "../..";
import {
    AnimationIndex,
    DRAG_DISTANCE_THRESHOLD,
    HEALTH_PER_SEGMENT,
    TILE_HEIGHT,
} from "../../config/constants";
import {
    chainToSimulatorCoord,
    simulatorToWorldCoord,
    worldToChainCoord,
} from "./coorConvert";
import { zeroEntity } from "../../../utils";
import { isEqual } from "lodash";
import { logDebug } from "../../../ui/lib/utils";
import { BattleEntityType } from "@zenith/simulator";
import { getCreatureProfile } from "../../../utils/componentHelpers";

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
                LocalPiece,
                LocalPieceOccupation,
                UserOperation,
            },
            account,
        },
    } = layer;

    function removePieceOnBoard(gid: number) {
        const entity = getEntityIdFromKeys([BigInt(gid)]);
        logDebug(`try remove piece ${entity} on board`);

        objectPool.remove(entity);

        const pieceHealthEntity = `${entity}-health` as Entity;

        if (getComponentValue(Health, pieceHealthEntity)) {
            // remove health bar
            updateComponent(Health, pieceHealthEntity, {
                pieceEntity: entity,
                max: 0,
                current: 0,
            });
        }
    }

    /**
     *
     * @param playerAddr
     * @param index
     * @param override whether to override previous one
     * @returns
     */
    function spawnPiece(entity: Entity, override = false) {
        const piece = getComponentValue(LocalPiece, entity);
        if (!piece) {
            throw Error(`try get piece ${entity}`);
        }

        const creatureProfile = getCreatureProfile(
            CreatureProfile,
            piece.creature_index,
            piece.level
        );

        const isEnemy = BigInt(account.address) !== piece.owner;

        const simulatorCoord = chainToSimulatorCoord({
            posX: piece.x,
            posY: piece.y,
            isHome: !isEnemy,
        });

        phaserSpawnPiece({
            ...creatureProfile,
            gid: piece.gid,
            entity: getEntityIdFromKeys([BigInt(piece.gid)]),
            x: simulatorCoord.simulatorX,
            y: simulatorCoord.simulatorY,
            creature_idx: creatureProfile.creature_index,
            spell_amp: 0,
            isHome: !isEnemy,
            maxHealth: creatureProfile.health,
            mana: 0,
            dead: false,
        });
    }

    /**
     * phaser canvas spawn piece
     */
    function phaserSpawnPiece({
        gid,
        entity,
        x,
        y,
        creature_idx,
        isHome,
        health,
        maxHealth,
    }: BattleEntityType & { gid: number }) {
        const pieceSprite = objectPool.get(entity, "Sprite");

        logDebug(`spawn piece ${gid} ${entity} on ${x} ${y}`);

        const { worldX, worldY } = simulatorToWorldCoord({
            posX: x,
            posY: y,
        });

        pieceSprite.setComponent({
            id: entity,
            once: (sprite: Phaser.GameObjects.Sprite) => {
                sprite.setVisible(true);
                sprite.setPosition(worldX, worldY);
                sprite.play(config.animations[AnimationIndex[creature_idx]]);
                sprite.setInteractive();

                const scale = TILE_HEIGHT / sprite.height;
                sprite.setScale(scale);

                sprite.on("pointerup", (p: Phaser.Input.Pointer) => {
                    if (p.distance < DRAG_DISTANCE_THRESHOLD) {
                        updateComponent(UserOperation, zeroEntity, {
                            selected: true,
                            selectGid: gid,
                        });
                    }
                });

                // set draggable for self piece
                if (isHome) {
                    game.scene.getScene("Main")?.input.setDraggable(sprite);

                    sprite.removeAllListeners("dragstart");
                    sprite.on("dragstart", (p: Phaser.Input.Pointer) => {
                        //
                    });

                    sprite.removeAllListeners("drag");
                    sprite.on(
                        "drag",
                        (
                            p: Phaser.Input.Pointer,
                            gameObj: Phaser.GameObjects.GameObject
                        ) => {
                            // set dragging to true
                            updateComponent(UserOperation, zeroEntity, {
                                dragging: true,
                                draggingGid: gid,
                            });
                        }
                    );

                    sprite.removeAllListeners("dragend");
                    sprite.on("dragend", (p: Phaser.Input.Pointer) => {
                        logDebug("drag end");
                        if (p.distance < DRAG_DISTANCE_THRESHOLD) {
                            updateComponent(UserOperation, zeroEntity, {
                                dragging: false,
                                draggingGid: 0,
                            });
                            return;
                        }
                        sprite.clearTint(); // clear tint color

                        // set dragging to false
                        updateComponent(UserOperation, zeroEntity, {
                            dragging: false,
                            draggingGid: 0,
                        });

                        const { posX, posY } = worldToChainCoord({
                            worldX: p.worldX,
                            worldY: p.worldY,
                            isHome,
                        });
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

                        updateComponent(LocalPiece, entity as Entity, {
                            x: posX,
                            y: posY,
                        });
                    });
                }
            },
        });

        const segment = Math.ceil(health / HEALTH_PER_SEGMENT);

        // initialize health bar
        setComponent(HealthBar, `${entity}-health-bar` as Entity, {
            x: worldX,
            y: worldY,
            currentHealth: health,
            segments: segment,
            filledSegments: segment,
            isPlayer: isHome,
        });

        // initialize health
        setComponent(Health, `${entity}-health` as Entity, {
            max: maxHealth,
            current: health,
            pieceEntity: entity,
        });
    }

    return { spawnPiece, phaserSpawnPiece, removePieceOnBoard };
};
