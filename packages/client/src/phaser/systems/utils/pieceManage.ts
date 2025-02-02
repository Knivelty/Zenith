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
    TILE_WIDTH,
} from "../../config/constants";
import {
    chainToSimulatorCoord,
    simulatorToWorldCoord,
    worldToChainCoord,
} from "./coorConvert";
import { zeroEntity } from "../../../utils";
import { logDebug } from "../../../ui/lib/utils";
import { BattleEntityType } from "@zenith/simulator";
import { getCreatureProfile } from "../../../utils/componentHelpers";
import { isEqual } from "lodash";
import { encodeEntityStatusBarEntity } from "./entityEncoder";

export const pieceManage = (layer: PhaserLayer) => {
    const {
        game,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                EntityStatusBar,
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

        // remove health-bar
        const pieceHealthEntity = `${entity}-health` as Entity;

        if (getComponentValue(Health, pieceHealthEntity)) {
            // remove health bar
            updateComponent(Health, pieceHealthEntity, {
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
            level: piece.level,
            maxMana: creatureProfile.maxMana,
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
        level,
        maxMana,
        mana,
    }: BattleEntityType & { gid: number }) {
        const pieceSprite = objectPool.get(entity, "Sprite");

        const { worldX, worldY } = simulatorToWorldCoord({
            posX: x,
            posY: y,
        });

        if (!isEqual(pieceSprite.position, { x: 0, y: 0 })) {
            if (isEqual({ x, y }, pieceSprite.position)) {
                logDebug(`piece ${gid} already spawned, skip`);
            } else {
                // adjust location
                pieceSprite.setComponent({
                    id: entity,
                    now: (sprite: Phaser.GameObjects.Sprite) => {
                        sprite.setPosition(worldX, worldY);
                    },
                });

                // update status bar
                updateComponent(
                    EntityStatusBar,
                    encodeEntityStatusBarEntity(entity),
                    {
                        x: worldX,
                        y: worldY,
                    }
                );
            }

            return;
        }

        logDebug(`spawn piece ${gid} ${entity} on ${x} ${y}, isHome ${isHome}`);

        pieceSprite.setComponent({
            id: entity,
            now: (sprite: Phaser.GameObjects.Sprite) => {
                sprite.setPosition(worldX, worldY);
                sprite.play(config.animations[AnimationIndex[creature_idx]]);
                sprite.setInteractive();

                const scale = Math.min(
                    TILE_HEIGHT / sprite.height,
                    TILE_WIDTH / sprite.width
                );

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
                        logDebug("drag start");
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
                                draggingFromBoard: true,
                            });
                        }
                    );

                    sprite.removeAllListeners("dragend");
                    sprite.on("dragend", (p: Phaser.Input.Pointer) => {
                        logDebug("drag end");

                        // set dragging to false
                        updateComponent(UserOperation, zeroEntity, {
                            dragging: false,
                            draggingGid: 0,
                            draggingFromBoard: false,
                        });

                        if (p.distance < DRAG_DISTANCE_THRESHOLD) {
                            return;
                        }
                        sprite.clearTint(); // clear tint color

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

        // initialize status bar
        setComponent(EntityStatusBar, encodeEntityStatusBarEntity(entity), {
            x: worldX,
            y: worldY,
            currentHealth: health,
            segments: segment,
            filledSegments: segment,
            isPlayer: isHome,
            mana,
            maxMana,
            level: level,
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
