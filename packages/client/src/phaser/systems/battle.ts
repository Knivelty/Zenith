import {
    Has,
    getComponentValue,
    getComponentValueStrict,
    updateComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
// import { BattleLog, BattleLogsType } from "../../dojo/generated/setup";
import { GameStatusEnum } from "../../dojo/types";
import { battleAnimation } from "./utils/playBattle";
import { BattleResult } from "../../utils/jps";
import { processBattle } from "./utils/processBattleLogs";
import { logDebug } from "../../ui/lib/utils";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        networkLayer: {
            clientComponents: {
                GameStatus,
                InningBattle,

                BattleLogs,
            },
            clientComponents,
            account: { address },
        },
    } = layer;

    const { playBattle } = battleAnimation(layer);

    defineSystemST<typeof InningBattle.schema>(
        world,
        [Has(InningBattle)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            // ignore irrelevant inning battle
            if (
                v.homePlayer !== BigInt(address) &&
                v.awayPlayer !== BigInt(address)
            ) {
                return;
            }

            const status = getComponentValueStrict(GameStatus, zeroEntity);

            // ignore stale update
            if (
                v.round < status?.currentRound &&
                v.currentMatch === status.currentMatch
            ) {
                console.warn("stale inning battle update");
                return;
            }

            logDebug("InningBattle update: ", entity, type, [v, preV]);

            updateComponent(GameStatus, zeroEntity, {
                currentRound: v.round,
                dangerous: v.dangerous,
            });

            if (Boolean(v.end) === false) {
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.Prepare,
                });
            } else if (Boolean(v.end) === true && v.winner === 0n) {
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.InBattle,
                });

                setTimeout(() => {
                    // delay to confirm is in battle
                    // calculate battle log in the frontend
                    const status = getComponentValueStrict(
                        GameStatus,
                        zeroEntity
                    );
                    if (
                        status.status === GameStatusEnum.InBattle &&
                        status.shouldPlay === false
                    ) {
                        processBattle(clientComponents).processBattleLogs();
                    }
                }, 1000);
            }
        }
    );

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if change from other to true, play the animation
            if (v?.shouldPlay === true && preV?.shouldPlay !== true) {
                const inningBattle = getComponentValueStrict(
                    InningBattle,
                    getEntityIdFromKeys([
                        BigInt(v.currentMatch),
                        BigInt(v.currentRound),
                    ])
                );

                console.log(
                    "get logs: ",
                    inningBattle.currentMatch,
                    inningBattle.round
                );

                const battleLogs = getComponentValue(
                    BattleLogs,
                    getEntityIdFromKeys([
                        BigInt(inningBattle.currentMatch),
                        BigInt(inningBattle.round),
                    ])
                );

                if (!battleLogs) {
                    console.warn("no battle log");

                    // // if not battle log, set status back
                    // updateComponent(GameStatus, entity, {
                    //     shouldPlay: false,
                    //     played: true,
                    //     status: GameStatusEnum.WaitForNextRound,
                    // });
                    return;
                }

                const logs = JSON.parse(
                    battleLogs.logs
                ) as BattleResult["logs"];

                console.log("battleLogs: ", logs);

                playBattle(logs).then(() => {
                    console.log("play finish");

                    // after play, set status back
                    updateComponent(GameStatus, entity, {
                        shouldPlay: false,
                        played: true,
                        status: GameStatusEnum.WaitForNextRound,
                    });
                });
            }
        }
    );
};
