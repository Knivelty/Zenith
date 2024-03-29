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
import {
    HealthBarOffSetY,
    MOVE_SPEED,
    Sprites,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../config/constants";
import { Sprite } from "@latticexyz/phaserx/src/types";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
// import { BattleLog, BattleLogsType } from "../../dojo/generated/setup";
import { Coord, deferred, sleep } from "@latticexyz/utils";
import { GameStatusEnum } from "../../dojo/types";
import { battleAnimation } from "./utils/playBattle";
import { BattleResult } from "../../utils/jps";

export const battle = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                GameStatus,
                InningBattle,
                Player,
                LocalPlayer,
                Piece,
                LocalPiece,
                LocalPlayerPiece,
                BattleLogs,
                Attack,
                CreatureProfile,
            },
            account: { address },
            playerEntity,
            graphqlClient,
        },
    } = layer;

    const { playBattle } = battleAnimation(layer);

    defineSystemST<typeof InningBattle.schema>(
        world,
        [Has(InningBattle)],
        ({ entity, type, value: [v, preV] }) => {
            console.log("update: ", entity, type, [v, preV]);
            if (!v) {
                return;
            }

            // ignore irrelevant inning battle
            if (
                v.homePlayer !== BigInt(address) ||
                v.awayPlayer !== BigInt(address)
            ) {
                return;
            }

            // sync current round
            updateComponent(GameStatus, zeroEntity, {
                // shouldPlay: false,
                // played: false,
                // status: GameStatusEnum.Prepare,
                currentRound: v.round,
            });

            if (v?.end == false) {
                console.log("prepare: ");
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.Prepare,
                });
            } else if (v.end == true) {
                updateComponent(GameStatus, zeroEntity, {
                    status: GameStatusEnum.InBattle,
                });

                // calculate battle log in the frontend
            }
        }
    );

    defineSystemST<typeof GameStatus.schema>(
        world,
        [Has(GameStatus)],
        ({ entity, type, value: [v, preV] }) => {
            // if change from false to true, play the animation
            if (v?.shouldPlay === true && preV?.shouldPlay == false) {
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
