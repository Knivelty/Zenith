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
} from "../../config/constants";
import { tween } from "@latticexyz/phaserx";
import { logDebug } from "../../../ui/lib/utils";
import { deferred } from "@latticexyz/utils";
import { GameStatusEnum } from "../../../dojo/types";
import { animationTime } from "./animationTime";
import { pieceManage } from "../utils/pieceManage";
import { encodeEntityStatusBarEntity } from "../utils/entityEncoder";

export const health = (layer: PhaserLayer) => {
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
        },
    } = layer;

    const { getAnimationTime } = animationTime(layer);
    const { removePieceOnBoard } = pieceManage(layer);

    defineSystemST<typeof Health.schema>(
        world,
        [Has(Health)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            logDebug("incoming health change", entity, preV, v);

            // update health bar
            const statusBarEntity = encodeEntityStatusBarEntity(
                entity.split("-")[0]
            );

            const filledSegments = Math.ceil(v.current / HEALTH_PER_SEGMENT);
            updateComponent(EntityStatusBar, statusBarEntity, {
                filledSegments: filledSegments,
                currentHealth: v.current,
            });

            // if max health is 0, it mean piece is dead
            // remove health bar object
            if (v.max == 0) {
                logDebug(`${v.pieceEntity} piece removed`);

                objectPool.remove(`${statusBarEntity}-point`);
                objectPool.remove(`${statusBarEntity}-level`);
            }
        }
    );

    // health Damage
    defineSystemST<typeof HealthChange.schema>(
        world,
        [Has(HealthChange)],
        ({ entity, type, value: [v, preV] }) => {
            logDebug("incoming health change", v);
            if (!v) {
                return;
            }

            if (v.change === 0) {
                return;
            }

            const gameStatus = getComponentValueStrict(GameStatus, zeroEntity);

            // only play health change animation when in battle
            if (gameStatus.status !== GameStatusEnum.InBattle) {
                return;
            }

            const healthChange = objectPool.get(entity, "Text");

            const [resolve, , promise] = deferred<void>();

            // spawn health bar
            healthChange.setComponent({
                id: entity,
                once: async (text: Phaser.GameObjects.Text) => {
                    logDebug(`spawn text`, v);
                    text.setText(
                        v.sign
                            ? "+" + v.change.toFixed(0)
                            : "-" + v.change.toFixed(0)
                    );
                    text.setVisible(true);
                    text.setFont("Dogica Pixel");
                    text.setColor("#FF3D00");
                    text.setFontSize(DAMAGE_TEXT_FONT_SIZE);
                    text.setPosition(
                        v.x + Health_CHANGE_OFFSET_X,
                        v.y + Health_CHANGE_OFFSET_Y
                    );
                    text.setAlpha(0);
                    await tween(
                        {
                            targets: text,
                            duration: getAnimationTime(
                                "HEALTH_CHANGE_SHOW_TIME"
                            ),
                            props: {
                                alpha: 1,
                            },
                            ease: Phaser.Math.Easing.Linear,
                            yoyo: true,
                            onComplete: async () => {
                                // resolve to allow next tween
                                resolve();
                                objectPool.remove(entity);
                            },
                            onUpdate: () => {
                                //
                            },
                        },
                        { keepExistingTweens: true }
                    );
                },
            });
        }
    );
};
