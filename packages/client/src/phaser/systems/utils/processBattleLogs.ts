import {
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";

import { getEntityIdFromKeys } from "@dojoengine/utils";
import { getOrder, getOrigins, zeroEntity } from "../../../utils";
import { ClientComponents } from "../../../dojo/createClientComponents";
import { logDebug } from "../../../ui/lib/utils";
import { BaseStateType, createSimulator } from "@zenith/simulator";
import { CreatureType } from "@zenith/simulator/src/schema/creature";
import { AbilityProfileType } from "@zenith/simulator/src/schema/ability_profile";

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

    async function processBattleLogs() {
        logDebug("start process battle logs");

        const status = getComponentValueStrict(GameStatus, zeroEntity);
        const v = getComponentValueStrict(
            InningBattle,
            getEntityIdFromKeys([
                BigInt(status.currentMatch),
                BigInt(status.currentRound),
            ])
        );

        // prepare data for simulator
        const allCreatures = new Array<CreatureType>();
        const allPieces = new Array<BaseStateType>();
        const allAbilitiesProfiles = new Array<AbilityProfileType>();

        // get player piece
        const player = getComponentValueStrict(
            LocalPlayer,
            getEntityIdFromKeys([v.homePlayer])
        );

        for (let i = 1; i <= player.heroesCount; i++) {
            const playerPiece = getComponentValueStrict(
                LocalPlayerPiece,
                getEntityIdFromKeys([v.homePlayer, BigInt(i)])
            );

            logDebug("playerPiece", playerPiece.gid);

            const pieceEntity = getEntityIdFromKeys([BigInt(playerPiece.gid)]);

            const piece = getComponentValue(LocalPiece, pieceEntity);

            if (!piece) {
                throw Error(
                    `try get piece error:  ${v.homePlayer}, ${BigInt(i)}`
                );
            }

            const creatureEntity = getEntityIdFromKeys([
                BigInt(piece.creature_index),
                BigInt(piece.level),
            ]);

            const creature = getComponentValueStrict(
                CreatureProfile,
                creatureEntity
            );

            allCreatures.push({
                creature_id: creatureEntity,
                health: creature.health,
                attack: creature.attack,
                armor: creature.armor,
                range: creature.range,
                speed: creature.speed,
                initiative: creature.initiative,
                origins: getOrigins(creature.origins),
                order: getOrder(creature.order),
                ability: "",
            });

            allPieces.push({
                id: pieceEntity,
                initX: piece.x - 1,
                initY: 8 - piece.y,
                isHome: true,
                creatureId: creatureEntity,
                level: piece.level,
            });
        }

        // TODO: reverse home and player on PvP
        // get enemy piece
        const enemy = getComponentValueStrict(
            LocalPlayer,
            getEntityIdFromKeys([v.awayPlayer])
        );

        const boost = status.dangerous ? 1.2 : 1;

        for (let i = 1; i <= enemy.heroesCount; i++) {
            const playerPiece = getComponentValueStrict(
                LocalPlayerPiece,
                getEntityIdFromKeys([v.awayPlayer, BigInt(i)])
            );

            const pieceEntity = getEntityIdFromKeys([BigInt(playerPiece.gid)]);

            console.log("piece: ", playerPiece);
            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            const creatureEntity = getEntityIdFromKeys([
                BigInt(piece.creature_index),
                BigInt(piece.level),
            ]);

            const creature = getComponentValueStrict(
                CreatureProfile,
                creatureEntity
            );

            allCreatures.push({
                creature_id: creatureEntity,
                health: creature.health,
                attack: creature.attack,
                armor: creature.armor,
                range: creature.range,
                speed: creature.speed,
                initiative: creature.initiative,
                origins: getOrigins(creature.origins),
                order: getOrder(creature.order),
                ability: "",
            });

            allPieces.push({
                id: pieceEntity,
                initX: piece.x - 1,
                initY: piece.y - 1,
                isHome: false,
                creatureId: creatureEntity,
                level: piece.level,
            });
        }

        const { calculateBattleLogs, destroyDB, getEmittedEvents } =
            await createSimulator(
                allCreatures,
                allPieces,
                allAbilitiesProfiles
            );

        const { result } = await calculateBattleLogs();

        await destroyDB();

        const allEvents = getEmittedEvents();

        console.log("set battle logs: ", v.currentMatch, v.round, allEvents);

        setComponent(
            BattleLogs,
            getEntityIdFromKeys([BigInt(v.currentMatch), BigInt(v.round)]),
            {
                matchId: v.currentMatch,
                inningBattleId: v.round,
                logs: JSON.stringify(allEvents),
                winner: result.win ? v.homePlayer : v.awayPlayer,
                healthDecrease: result.healthDecrease ?? 0,
            }
        );

        setTimeout(() => {
            // play animation after calculate successfully
            updateComponent(GameStatus, zeroEntity, {
                shouldPlay: true,
            });
        }, 1000);

        return { allEvents, result };
    }

    return { processBattleLogs };
};
