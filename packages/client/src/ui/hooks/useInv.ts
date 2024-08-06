import {
    getComponentValue,
    getComponentValueStrict,
    HasValue,
    NotValue,
} from "@dojoengine/recs";
import { useDojo } from "./useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { PieceAttr, getHeroAttr } from "./useHeroAttr";
import { logDebug } from "../lib/utils";

export function useLocalInv() {
    const {
        clientComponents: { LocalPiece, CreatureProfile, Piece },
        account: {
            account: { address: playerAddr },
        },
    } = useDojo();

    const localInvPieces = useEntityQuery([
        HasValue(LocalPiece, { owner: BigInt(playerAddr) }),
        NotValue(LocalPiece, { slot: 0 }),
    ]);

    const invPieces = useMemo(() => {
        const pieces = Array(6).fill(undefined);
        localInvPieces.forEach((pieceEntity) => {
            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            pieces[piece.slot - 1] = {
                ...getHeroAttr(CreatureProfile, {
                    id: piece.creature_index,
                    level: piece.level,
                }),
                gid: piece.gid,
                isOverride: Piece.isEntityOverride(pieceEntity),
            } as PieceAttr;
        });

        return pieces;
    }, [CreatureProfile, LocalPiece, Piece, localInvPieces]);

    const emptyMap: Record<number, boolean> = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
    };

    localInvPieces.forEach((pieceEntity) => {
        const piece = getComponentValueStrict(LocalPiece, pieceEntity);
        emptyMap[piece.slot] = true;
    });

    const emptySlots = Object.entries(emptyMap)
        .filter((v) => v[1] === false)
        .map((v) => Number(v[0]) - 1);

    return { invPieces, emptySlots };
}

export function useInv() {
    const {
        clientComponents: { PlayerInvPiece, Piece, CreatureProfile },
        account: {
            account: { address: playerAddr },
        },
    } = useDojo();

    const invPieceEntities = useEntityQuery([
        HasValue(Piece, { owner: BigInt(playerAddr) }),
        NotValue(Piece, { slot: 0 }),
    ]);

    const invPieces = useMemo(() => {
        const pieces = Array(6).fill(undefined);
        invPieceEntities.forEach((pieceEntity) => {
            const piece = getComponentValueStrict(Piece, pieceEntity);

            pieces[piece.slot - 1] = {
                ...getHeroAttr(CreatureProfile, {
                    id: piece.creature_index,
                    level: piece.level,
                }),
                gid: piece.gid,
                isOverride: Piece.isEntityOverride(pieceEntity),
            } as PieceAttr;
        });

        return pieces;
    }, [CreatureProfile, Piece, invPieceEntities]);

    const emptyMap: Record<number, boolean> = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
    };

    invPieceEntities.forEach((pieceEntity) => {
        const piece = getComponentValueStrict(Piece, pieceEntity);
        emptyMap[piece.slot] = true;
    });

    const invGids = Array(6).fill(undefined);

    Array.from(invPieceEntities).forEach((pieceEntity) => {
        const p = getComponentValueStrict(Piece, pieceEntity);

        invGids[p.slot - 1] = p.gid;
    });

    const firstEmptyInv = getFirstEmptySlot(invGids);

    return { invPieces, firstEmptyInv };
}

export function getFirstEmptySlot(invGids: (number | undefined)[]) {
    const emptySlots = invGids
        .map((item, index) =>
            item == 0 || item == undefined ? index + 1 : undefined
        )
        .filter((index) => index !== undefined) as number[];

    const firstEmptyInv = emptySlots.length > 0 ? emptySlots[0] : 0;

    return firstEmptyInv;
}
