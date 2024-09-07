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

        // add player piece
        setComponent(LocalPiece, getPieceEntity(1), {
            gid: 1,
            owner: status.homePlayer,
            x: 4,
            y: 5,
            level: 3,
            creature_index: 3004,
            idx: 1,
            slot: 0,
        });

        // add enemy piece
        setComponent(LocalPiece, getPieceEntity(2), {
            gid: 2,
            owner: status.awayPlayer,
            x: 3,
            y: 3,
            level: 1,
            creature_index: 1001,
            idx: 1,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(3), {
            gid: 3,
            owner: status.awayPlayer,
            x: 4,
            y: 3,
            level: 1,
            creature_index: 1003,
            idx: 2,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(4), {
            gid: 4,
            owner: status.awayPlayer,
            x: 3,
            y: 4,
            level: 1,
            creature_index: 2002,
            idx: 3,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(5), {
            gid: 5,
            owner: status.awayPlayer,
            x: 5,
            y: 3,
            level: 1,
            creature_index: 3001,
            idx: 4,
            slot: 0,
        });
        setComponent(LocalPiece, getPieceEntity(6), {
            gid: 6,
            owner: status.awayPlayer,
            x: 5,
            y: 4,
            level: 1,
            creature_index: 2001,
            idx: 5,
            slot: 0,
        });

        processBattleLogs();

        updateComponent(GameStatus, zeroEntity, {
            status: GameStatusEnum.InBattle,
        });
    }, [GameStatus, LocalPiece, processBattleLogs]);
    return { mockBattle };
}
