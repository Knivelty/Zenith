import { useEntityQuery } from "@dojoengine/react";
import { getComponentValueStrict, HasValue } from "@dojoengine/recs";
import { useDojo } from "./useDojo";

// TODO: recursively merge
export function useMergeAble(creature_id: number) {
    const {
        clientComponents: { Piece },
        account: {
            account: { address },
        },
    } = useDojo();

    const allOwnedPiecesEntities = useEntityQuery([
        HasValue(Piece, { owner: BigInt(address) }),
    ]);

    const allMetPieces = allOwnedPiecesEntities
        .map((entity) => {
            const p = getComponentValueStrict(Piece, entity);
            return p;
        })
        .filter((p) => {
            return p.creature_index === creature_id && p.level === 1;
        });

    const canMerge = allMetPieces.length >= 2;
    const mergedWith = canMerge ? [allMetPieces[0], allMetPieces[1]] : [];

    const gids = mergedWith.map((p) => p.gid);

    const onBoardCoord = mergedWith
        .map((p) => {
            return { x: p.x, y: p.y };
        })
        .filter((c) => c.x !== 0 && c.y !== 0)?.[0] || { x: 0, y: 0 };
    const boardIdx = mergedWith.map((p) => p.idx).filter(Boolean)?.[0] || 0;
    const invSlot = mergedWith.map((p) => p.slot).filter(Boolean)?.[0] || 0;

    return { canMerge, gids, boardIdx, onBoardCoord, invSlot };
}
