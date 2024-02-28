import {
    Entity,
    Has,
    UpdateType,
    defineSystem,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
    ComponentValue,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord, tween } from "@latticexyz/phaserx";
import { TILE_HEIGHT, TILE_WIDTH } from "../config/constants";
import { Sprite } from "@latticexyz/phaserx/src/types";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
import { BattleLog, BattleLogsType } from "../../dojo/generated/setup";
import { resolve } from "path";
import { deferred } from "@latticexyz/utils";
import { GameStatusEnum } from "../../dojo/types";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Piece,
                GameStatus,
                InningBattle,
                Player,
                BattleLogs,
            },
            account,
            graphqlClient,
        },
    } = layer;

    defineSystemST<typeof InningBattle.schema>(
        world,
        [Has(InningBattle)],
        ({ entity, type, value: [v, preV] }) => {
            console.log("update: ", entity, type, [v, preV]);
            if (!v) {
                return;
            }
            if (type == UpdateType.Enter) {
                setComponent(GameStatus, zeroEntity, {
                    shouldPlay: false,
                    played: false,
                    status: GameStatusEnum.Prepare,
                    currentRound: v.index,
                });
            }

            if (v?.end == false) {
                console.log("prepare: ");
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.Prepare,
                });
            }
        }
    );

    async function playBattle(logs: BattleLog[]) {
        for (const l of logs) {
            await playSingleBattle(l);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            console.log("next");
        }
    }

    async function playSingleBattle(v: BattleLog) {
        const [resolve, , promise] = deferred<void>();

        const pieceEntity = getEntityIdFromKeys([
            BigInt(v.player),
            BigInt(v.pieceId),
        ]);

        const nextPos = {
            x: v.to_x,
            y: v.to_y,
        };

        const pixelPosition = tileCoordToPixelCoord(
            nextPos,
            TILE_WIDTH,
            TILE_HEIGHT
        );

        const hero = objectPool.get(pieceEntity, "Sprite");

        hero.setComponent({
            id: pieceEntity,
            now: async (sprite: Phaser.GameObjects.Sprite) => {
                console.log("set tween", pixelPosition, pieceEntity);
                const result = await tween(
                    {
                        targets: sprite,
                        duration: 500,
                        props: {
                            x: pixelPosition.x,
                            y: pixelPosition.y,
                        },
                        ease: Phaser.Math.Easing.Linear,
                        onComplete: () => {
                            console.log("complete");
                        },
                    },
                    { keepExistingTweens: true }
                );

                resolve(result);
            },
        });

        return promise;
    }

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if change from false to true, play the animation
            if (v?.shouldPlay === true && preV?.shouldPlay == false) {
                const play = v;

                if (play?.shouldPlay == true) {
                    const inningBattle = getComponentValueStrict(
                        InningBattle,
                        getEntityIdFromKeys([BigInt(v.currentRound)])
                    );

                    const battleLogs = getComponentValueStrict(
                        BattleLogs,
                        inningBattle.index.toString() as Entity
                    ) as BattleLogsType;

                    const logs = JSON.parse(battleLogs.logs) as BattleLog[];

                    playBattle(logs).then(() => {
                        console.log("play finish");

                        // after play, set status back
                        updateComponent(GameStatus, entity, {
                            shouldPlay: false,
                            played: true,
                            status: GameStatusEnum.Prepare,
                        });
                    });
                }
            }
        }
    );
};
