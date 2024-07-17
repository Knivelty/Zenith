import { getComponentValue, getComponentValueStrict } from "@dojoengine/recs";
import { useDojo } from "./useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";
import { useComponentValue } from "@dojoengine/react";
import { HeroBaseAttr, PieceAttr, getHeroAttr } from "./useHeroAttr";
import { logDebug } from "../lib/utils";

export function useLocalInv() {
    const {
        clientComponents: {
            LocalPlayerInvPiece,
            LocalPiece,
            CreatureProfile,
            Piece,
        },
        systemCalls: { buyHero },
        account: {
            playerEntity,
            account: { address: playerAddr },
        },
    } = useDojo();

    const localInv1 = useComponentValue(
        LocalPlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 1n])
    );

    const localInv2 = useComponentValue(
        LocalPlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 2n])
    );
    const localInv3 = useComponentValue(
        LocalPlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 3n])
    );
    const localInv4 = useComponentValue(
        LocalPlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 4n])
    );
    const localInv5 = useComponentValue(
        LocalPlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 5n])
    );

    const localInv6 = useComponentValue(
        LocalPlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 6n])
    );

    const localInvGids = [
        localInv1?.gid,
        localInv2?.gid,
        localInv3?.gid,
        localInv4?.gid,
        localInv5?.gid,
        localInv6?.gid,
    ];

    const invPieces = useMemo(() => {
        return localInvGids.map((gid) => {
            if (!gid) {
                return undefined;
            }
            const pieceEntity = getEntityIdFromKeys([BigInt(gid)]);
            const piece = getComponentValue(
                LocalPiece,
                getEntityIdFromKeys([BigInt(gid)])
            );
            if (!piece) {
                return undefined;
            }

            return {
                ...getHeroAttr(CreatureProfile, {
                    id: piece.creature_index,
                    level: piece.level,
                }),
                gid: gid,
                isOverride: Piece.isEntityOverride(pieceEntity),
            } as PieceAttr;
        });
    }, [
        CreatureProfile,
        LocalPiece,
        LocalPiece.update$.asObservable,
        localInvGids,
    ]);

    const emptySlots = localInvGids
        .map((item, index) =>
            item == 0 || item == undefined ? index + 1 : undefined
        )
        .filter((index) => index !== undefined) as number[];

    // const firstEmptyInv = emptySlots.length > 0 ? emptySlots[0] : 0;

    return { invPieces, emptySlots };
}

export function useInv() {
    const {
        clientComponents: { PlayerInvPiece, Piece, CreatureProfile },
        account: {
            account: { address: playerAddr },
        },
    } = useDojo();

    const inv1 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 1n])
    );
    const inv2 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 2n])
    );
    const inv3 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 3n])
    );
    const inv4 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 4n])
    );
    const inv5 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 5n])
    );
    const inv6 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 6n])
    );

    const invGids = [
        inv1?.gid,
        inv2?.gid,
        inv3?.gid,
        inv4?.gid,
        inv5?.gid,
        inv6?.gid,
    ];

    logDebug(`inv gids: `, invGids);

    const invPieces = useMemo(() => {
        return invGids.map((gid) => {
            if (!gid) {
                return undefined;
            }
            const piece = getComponentValueStrict(
                Piece,
                getEntityIdFromKeys([BigInt(gid)])
            );

            return {
                ...getHeroAttr(CreatureProfile, {
                    id: piece.creature_index,
                    level: piece.level,
                }),
                gid: gid,
            } as PieceAttr;
        });
    }, [CreatureProfile, Piece, Piece.update$.asObservable, invGids]);

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
