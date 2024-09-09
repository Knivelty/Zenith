import {
    Entity,
    Has,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { defineSystemST, zeroEntity } from "../../../utils";
import { PhaserLayer } from "../..";
import {
    Assets,
    DAMAGE_TEXT_FONT_SIZE,
    HEALTH_BAR_BORDER_COLOR,
    HEALTH_BAR_BORDER_WIDTH,
    HEALTH_BAR_EMPTY_COLOR,
    HEALTH_BAR_ENEMY_COLOR,
    HEALTH_BAR_HEIGHT,
    HEALTH_BAR_PLAYER_COLOR,
    HEALTH_BAR_WIDTH,
    HEALTH_PER_SEGMENT,
    HealthBarOffSetY,
    Health_CHANGE_OFFSET_X,
    Health_CHANGE_OFFSET_Y,
    LevelOffSetX,
    MANA_BAR_HEIGHT,
    MANA_BAR_OFFSET_X,
    MANA_BAR_OFFSET_Y,
    MANA_BAR_WIDTH,
    MANA_FILL_COLOR,
    Sprites,
} from "../../config/constants";
import { tween } from "@latticexyz/phaserx";
import { logDebug } from "../../../ui/lib/utils";
import { deferred } from "@latticexyz/utils";
import { GameStatusEnum } from "../../../dojo/types";
import { animationTime } from "./animationTime";
import { pieceManage } from "../utils/pieceManage";
import { encodeEntityStatusBarEntity } from "../utils/entityEncoder";

function getLevelSprite(level: number, isHome: boolean): Sprites {
    if (isHome) {
        switch (level) {
            case 1:
                return Sprites.LevelOneGreen;
            case 2:
                return Sprites.LevelTwoGreen;
            case 3:
                return Sprites.LevelThreeGreen;

            default:
                return Sprites.LevelOneGreen;
        }
    } else {
        switch (level) {
            case 1:
                return Sprites.LevelOneRed;
            case 2:
                return Sprites.LevelTwoRed;
            case 3:
                return Sprites.LevelThreeRed;

            default:
                return Sprites.LevelOneRed;
        }
    }
}

export const entityStatusBar = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Health,
                HealthChange,
                EntityStatusBar,
                LocalPiece,
                GameStatus,
            },
            account: { address },
        },
    } = layer;

    const { getAnimationTime } = animationTime(layer);
    const { removePieceOnBoard } = pieceManage(layer);

    // entity status bar
    defineSystemST<typeof EntityStatusBar.schema>(
        world,
        [Has(EntityStatusBar)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            const graphics = objectPool.get(`${entity}-point`, "Graphics");
            const pieceEntity = entity.split("-")[0];

            const localPiece = getComponentValue(
                LocalPiece,
                pieceEntity as Entity
            );

            if (localPiece?.idx === 0 || !localPiece) {
                // it mean piece is not on board
                return;
            }

            const isHome = localPiece.owner === BigInt(address);

            const levelObj = objectPool.get(`${entity}-level`, "Sprite");
            const levelSprite =
                config.sprites[getLevelSprite(localPiece.level, isHome)];

            levelObj.setComponent({
                id: entity,
                once: async (sprite: Phaser.GameObjects.Sprite) => {
                    sprite.setTexture(levelSprite.assetKey, levelSprite.frame);
                    sprite.setPosition(v.x, v.y - HealthBarOffSetY);
                    console.log("level sprite: ", sprite);
                },
            });

            const levelObjWidth = LevelOffSetX[localPiece.level];

            // spawn health bar
            graphics.setComponent({
                id: entity,
                once: async (graphics: Phaser.GameObjects.Graphics) => {
                    graphics.setVisible(true);

                    graphics.clear();

                    // draw health
                    const fillColor = v.isPlayer
                        ? HEALTH_BAR_PLAYER_COLOR
                        : HEALTH_BAR_ENEMY_COLOR;

                    const segmentWidth =
                        (HEALTH_BAR_WIDTH - levelObjWidth) / v.segments;

                    const segmentInterval = 0.5;

                    for (let i = 0; i < v.segments; i++) {
                        const x = i * segmentWidth;
                        const y = 0;

                        // Draw filled or empty segment
                        graphics.fillStyle(
                            i < v.filledSegments
                                ? fillColor
                                : HEALTH_BAR_EMPTY_COLOR,
                            1
                        );

                        graphics.fillRect(
                            x,
                            y,
                            segmentWidth - segmentInterval,
                            HEALTH_BAR_HEIGHT
                        );

                        // Draw border
                        graphics.lineStyle(
                            HEALTH_BAR_BORDER_WIDTH,
                            HEALTH_BAR_BORDER_COLOR,
                            1
                        );
                        graphics.strokeRect(
                            x,
                            y,
                            segmentWidth,
                            HEALTH_BAR_HEIGHT
                        );
                    }

                    // draw mana
                    const manaWidth =
                        Math.min(v.mana / v.maxMana, 1) * MANA_BAR_WIDTH;

                    graphics.fillStyle(MANA_FILL_COLOR, 1);

                    graphics.fillRect(
                        MANA_BAR_OFFSET_X,
                        MANA_BAR_OFFSET_Y,
                        manaWidth,
                        MANA_BAR_HEIGHT
                    );

                    graphics.setPosition(
                        v.x + levelObjWidth,
                        v.y - HealthBarOffSetY
                    );

                    logDebug(`spawn health bar on ${v.x} ${v.y}`);
                },
            });

            // update health change
            const healthChangeEntity = `${entity.split("-")[0]}-health-change`;
            const change = !preV?.currentHealth
                ? 0
                : v.currentHealth - preV.currentHealth;
            const sign = change > 0 ? true : false;
            setComponent(HealthChange, healthChangeEntity as Entity, {
                x: v.x,
                y: v.y - HealthBarOffSetY,
                change: Math.abs(change),
                sign,
            });
        }
    );
};
