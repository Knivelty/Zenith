import {
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { zeroEntity } from "../../../utils";
// import { BattleLog, BattleLogsType } from "../../dojo/generated/setup";
import { PieceInBattle, calculateBattleLogs } from "../../../utils/jps";

import { ClientComponents } from "../../../dojo/createClientComponents";
import { logDebug } from "../../../ui/lib/utils";

export const processBattle = (component: ClientComponents) => {
    const {
        GameStatus,
        InningBattle,
        LocalPlayer,
        LocalPlayerPiece,
        LocalPiece,
        CreatureProfile,
        BattleLogs,
    } = component;

    function processBattleLogs() {
        logDebug("start process battle logs");

        const status = getComponentValueStrict(GameStatus, zeroEntity);
        const v = getComponentValueStrict(
            InningBattle,
            getEntityIdFromKeys([
                BigInt(status.currentMatch),
                BigInt(status.currentRound),
            ])
        );

        // get all piece
        const allPieceInBattle = new Array<PieceInBattle>();

        // get player piece
        const player = getComponentValueStrict(
            LocalPlayer,
            getEntityIdFromKeys([v.homePlayer])
        );

        for (let i = 1; i <= player.heroesCount; i++) {
            console.log(v.homePlayer, BigInt(i));

            const playerPiece = getComponentValueStrict(
                LocalPlayerPiece,
                getEntityIdFromKeys([v.homePlayer, BigInt(i)])
            );

            const pieceEntity = getEntityIdFromKeys([BigInt(playerPiece.gid)]);

            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            const creature = getComponentValueStrict(
                CreatureProfile,
                getEntityIdFromKeys([
                    BigInt(piece.creature_index),
                    BigInt(piece.level),
                ])
            );

            allPieceInBattle.push({
                player: getEntityIdFromKeys([v.homePlayer]),
                entity: pieceEntity,
                x: piece.x - 1,
                y: 8 - piece.y,
                health: creature.health,
                attack: creature.attack,
                armor: creature.armor,
                speed: creature.speed,
                range: creature.range,
                isInHome: true,
                dead: false,
            });
        }

        // TODO: reverse home and player on PvP
        // get enemy piece
        const enemy = getComponentValueStrict(
            LocalPlayer,
            getEntityIdFromKeys([v.awayPlayer])
        );

        for (let i = 1; i <= enemy.heroesCount; i++) {
            const playerPiece = getComponentValueStrict(
                LocalPlayerPiece,
                getEntityIdFromKeys([v.awayPlayer, BigInt(i)])
            );

            const pieceEntity = getEntityIdFromKeys([BigInt(playerPiece.gid)]);

            console.log("piece: ", playerPiece);
            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            const creature = getComponentValueStrict(
                CreatureProfile,
                getEntityIdFromKeys([
                    BigInt(piece.creature_index),
                    BigInt(piece.level),
                ])
            );

            allPieceInBattle.push({
                player: getEntityIdFromKeys([v.awayPlayer]),
                entity: pieceEntity,
                x: piece.x - 1,
                y: piece.y - 1,
                health: creature.health,
                attack: creature.attack,
                armor: creature.armor,
                speed: creature.speed,
                range: creature.range,
                isInHome: false,
                dead: false,
            });
        }

        const { logs, result } = calculateBattleLogs(allPieceInBattle);

        console.log("set battle logs: ", v.currentMatch, v.round, logs);

        setComponent(
            BattleLogs,
            getEntityIdFromKeys([BigInt(v.currentMatch), BigInt(v.round)]),
            {
                matchId: v.currentMatch,
                inningBattleId: v.round,
                logs: JSON.stringify(logs),
                winner: result.win ? v.homePlayer : v.awayPlayer,
                healthDecrease: result.healthDecrease,
            }
        );

        setTimeout(() => {
            // play animation after calculate successfully
            updateComponent(GameStatus, zeroEntity, {
                shouldPlay: true,
            });
        }, 1000);

        return { logs, result };
    }

    return { processBattleLogs };
};
