import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getOrder, getOrigins } from "../../utils";
import * as R from "ramda";

export function useAllPiecesWithTraits() {
    const {
        clientComponents: {
            LocalPiece,
            LocalPlayer,
            LocalPlayerPiece,
            CreatureProfile,
        },
        account: {
            playerEntity,
            account: { address },
        },
    } = useDojo();

    const playerV = useComponentValue(LocalPlayer, playerEntity);

    const piecesWithTraits = new Array(playerV?.heroesCount)
        .fill(1)
        .map((_, i) => {
            console.log("i", i);
            const playerPiece = getComponentValueStrict(
                LocalPlayerPiece,
                getEntityIdFromKeys([BigInt(address), BigInt(i + 1)])
            );
            const piece = getComponentValueStrict(
                LocalPiece,
                getEntityIdFromKeys([BigInt(playerPiece.gid)])
            );

            const pieceCreature = getComponentValueStrict(
                CreatureProfile,
                getEntityIdFromKeys([
                    BigInt(piece.creature_index),
                    BigInt(piece.level),
                ])
            );

            const traits = [
                getOrder(pieceCreature.order),
                ...getOrigins(pieceCreature.origins),
            ];

            console.log("ttt: ", traits);

            return {
                pieceId: piece.gid,
                traits,
                creature_index: pieceCreature.creature_index,
            };
        });

    return piecesWithTraits;
}

export function usePieceCountWithTrait(trait: string | undefined) {
    const piecesWithTraits = useAllPiecesWithTraits();

    console.log("piecesWithTraits: ", piecesWithTraits);

    if (!trait) {
        return 0;
    }

    const count = R.pipe(
        R.filter(
            (piece: {
                pieceId: number;
                traits: string[];
                creature_index: number;
            }) => R.includes(trait, piece?.traits)
        ),
        R.uniqBy(R.prop("creature_index"))
    )(piecesWithTraits);

    return count.length;
}
