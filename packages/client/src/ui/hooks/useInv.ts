import { getComponentValue, getComponentValueStrict } from "@dojoengine/recs";
import { useDojo } from "./useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";
import { useComponentValue } from "@dojoengine/react";
import { HeroBaseAttr, PieceAttr, getHeroAttr } from "./useHeroAttr";

export function useLocalInv() {
    const {
        clientComponents: { LocalPlayerInvPiece, LocalPiece, CreatureProfile },
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
            const piece = getComponentValueStrict(
                LocalPiece,
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
        systemCalls: { buyHero },
        account: {
            playerEntity,
            account: { address: playerAddr },
        },
    } = useDojo();

    const inv1 = useComponentValue(
        PlayerInvPiece,
        getEntityIdFromKeys([BigInt(playerAddr), 1n])
    );

    console.log("inv1: ", inv1);

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

    const emptySlots = invGids
        .map((item, index) =>
            item == 0 || item == undefined ? index + 1 : undefined
        )
        .filter((index) => index !== undefined) as number[];

    const firstEmptyInv = emptySlots.length > 0 ? emptySlots[0] : 0;

    return { invPieces, emptySlots, firstEmptyInv };
}
