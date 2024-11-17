import {
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { getLocalPlayerBoardPieceEntities, zeroEntity } from "../../utils";
import { useDojo } from "./useDojo";
import { useCallback } from "react";
import { getPieceEntity, logDebug } from "../lib/utils";
import { processBattle } from "../../phaser/systems/utils/processBattleLogs";
import { GameStatusEnum } from "../../dojo/types";

export function useMockBattle() {
    const {
        clientComponents: { LocalPiece, GameStatus, InningBattle },
        account: { account },
        clientComponents,
    } = useDojo();

    const { processBattleLogs } = processBattle(clientComponents);
    const mockBattle = useCallback(() => {
        const status = getComponentValueStrict(GameStatus, zeroEntity);

        const pieceEntities = getLocalPlayerBoardPieceEntities(
            LocalPiece,
            status.homePlayer
        );

        const enemyPieceEntities = getLocalPlayerBoardPieceEntities(
            LocalPiece,
            status.awayPlayer
        );

        logDebug("enemyPieceEntities: ", enemyPieceEntities);

        [...pieceEntities, ...enemyPieceEntities].forEach((e) => {
            updateComponent(LocalPiece, e, {
                owner: 0n,
                idx: 0,
                slot: 0,
                x: 0,
                y: 0,
            });
        });

        // add away piece
        setComponent(LocalPiece, getPieceEntity(1), {
            gid: 1,
            owner: status.awayPlayer,
            x: 4,
            y: 5,
            level: 4,
            creature_index: 2,
            idx: 1,
            slot: 0,
        });

        // add home piece
        setComponent(LocalPiece, getPieceEntity(2), {
            gid: 2,
            owner: status.homePlayer,
            x: 3,
            y: 3,
            level: 1,
            creature_index: 3001,
            idx: 1,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(3), {
            gid: 3,
            owner: status.homePlayer,
            x: 4,
            y: 3,
            level: 1,
            creature_index: 1003,
            idx: 2,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(4), {
            gid: 4,
            owner: status.homePlayer,
            x: 3,
            y: 4,
            level: 1,
            creature_index: 2002,
            idx: 3,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(5), {
            gid: 5,
            owner: status.homePlayer,
            x: 2,
            y: 3,
            level: 1,
            creature_index: 3001,
            idx: 4,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(6), {
            gid: 6,
            owner: status.homePlayer,
            x: 2,
            y: 4,
            level: 1,
            creature_index: 2001,
            idx: 5,
            slot: 0,
        });

        processBattleLogs({
            // battleEntity: [
            //     {
            //         entity: getPieceEntity(1),
            //         mana: 100,
            //         spell_amp: 200,
            //         initiative: 999,
            //         health: 1700,
            //     },
            //     {
            //         entity: getPieceEntity(2),
            //         health: 300,
            //     },
            //     {
            //         entity: getPieceEntity(3),
            //         health: 500,
            //     },
            //     {
            //         entity: getPieceEntity(4),
            //         health: 400,
            //     },
            //     {
            //         entity: getPieceEntity(5),
            //         health: 200,
            //     },
            //     {
            //         entity: getPieceEntity(6),
            //         health: 50,
            //     },
            // ],
        });

        updateComponent(GameStatus, zeroEntity, {
            status: GameStatusEnum.InBattle,
        });
    }, [GameStatus, LocalPiece, processBattleLogs]);
    return { mockBattle };
}
