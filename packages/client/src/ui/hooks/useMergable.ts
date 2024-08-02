import { useEntityQuery } from "@dojoengine/react";
import { getComponentValueStrict, HasValue } from "@dojoengine/recs";
import { useDojo } from "./useDojo";
import { logDebug } from "../lib/utils";

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
            return p.creature_index === creature_id;
        });

    const levelOnePieces = allMetPieces.filter((p) => p.level === 1);
    const levelTwoPieces = allMetPieces.filter((p) => p.level === 2);

    const canMerge = levelOnePieces.length >= 2;

    // merge level one
    const mergedToWith = canMerge ? [levelOnePieces[0], levelOnePieces[1]] : [];

    // board idx invSlot is calculate on chain, client side calculation is used for op render

    // merge to level two
    if (levelTwoPieces.length >= 2) {
        mergedToWith.push(levelTwoPieces[0]);
        mergedToWith.push(levelTwoPieces[1]);
    }

    const boardIdx =
        mergedToWith
            .map((p) => p.idx)
            .filter(Boolean)
            .sort((a, b) => a - b)?.[0] || 0;

    const onBoardCoord = mergedToWith
        .map((p) => {
            return { x: p.x, y: p.y };
        })
        .filter((c) => c.x !== 0 && c.y !== 0)?.[0] || { x: 0, y: 0 };

    const invSlot =
        mergedToWith
            .map((p) => p.slot)
            .filter(Boolean)
            .sort((a, b) => a - b)?.[0] || 0;

    const gids = mergedToWith.map((p) => p.gid);

    logDebug("mergedToWith: ", mergedToWith);

    return { canMerge, gids, boardIdx, onBoardCoord, invSlot };
}
