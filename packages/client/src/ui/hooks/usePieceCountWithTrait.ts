import { useDojo } from "./useDojo";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import {
    HasValue,
    NotValue,
    getComponentValueStrict,
    runQuery,
} from "@dojoengine/recs";
import { getOrder, getOrigins } from "../../utils";
import * as R from "ramda";
import { ClientComponents } from "../../dojo/createClientComponents";
import { useEntityQuery } from "@dojoengine/react";

export function getAllPiecesWithAllTraits({
    clientComponents: { LocalPiece, CreatureProfile },
    playerAddress,
}: {
    clientComponents: ClientComponents;
    playerAddress: string;
}) {
    const onBoardPieceEntity = runQuery([
        HasValue(LocalPiece, { owner: BigInt(playerAddress) }),
        NotValue(LocalPiece, { idx: 0 }),
    ]);

    const piecesWithTraits = Array.from(onBoardPieceEntity).map((entity) => {
        const piece = getComponentValueStrict(LocalPiece, entity);

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

        return {
            pieceId: piece.gid,
            traits,
            creature_index: pieceCreature.creature_index,
        };
    });

    return piecesWithTraits;
}

export function useAllPiecesWithAllTraits() {
    const {
        clientComponents: { LocalPiece, CreatureProfile },
        account: {
            account: { address },
        },
    } = useDojo();

    const onBoardPieceEntity = useEntityQuery([
        HasValue(LocalPiece, { owner: BigInt(address) }),
        NotValue(LocalPiece, { idx: 0 }),
    ]);

    const piecesWithTraits = Array.from(onBoardPieceEntity).map((entity) => {
        const piece = getComponentValueStrict(LocalPiece, entity);

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

        return {
            pieceId: piece.gid,
            traits,
            creature_index: pieceCreature.creature_index,
        };
    });

    return piecesWithTraits;
}

export function usePieceCountWithTrait(trait: string | undefined) {
    const piecesWithTraits = useAllPiecesWithAllTraits();

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
