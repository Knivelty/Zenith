import { getEntityIdFromKeys } from "@dojoengine/utils";
import {
    Entity,
    HasValue,
    NotValue,
    getComponentValueStrict,
    runQuery,
} from "@dojoengine/recs";
import { getOrder, getOrigins } from "../../utils";
import * as R from "ramda";
import { ClientComponents } from "../../dojo/createClientComponents";

export function getAllBoardPiecesWithAllTraits({
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

export function getTraitPieceCount({
    traitName,
    clientComponents: { LocalPiece, CreatureProfile },
    inventoryPieceEntities,
    onBoardPieceEntities,
}: {
    traitName: string;
    clientComponents: ClientComponents;
    inventoryPieceEntities: Entity[];
    onBoardPieceEntities: Entity[];
}) {
    function getPieceWithTraitAndCreatureIdx(entity: Entity) {
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
    }

    const onBoardPiecesWithTraits = Array.from(onBoardPieceEntities).map(
        getPieceWithTraitAndCreatureIdx
    );

    const inventoryPiecesWithTraits = Array.from(inventoryPieceEntities).map(
        getPieceWithTraitAndCreatureIdx
    );

    const onBoardPieceCount = getPieceCountWithTrait(
        onBoardPiecesWithTraits,
        traitName
    );
    const inventoryPieceCount = getPieceCountWithTrait(
        inventoryPiecesWithTraits,
        traitName
    );

    return {
        onBoardPiecesWithTraits,
        inventoryPiecesWithTraits,
        onBoardPieceCount,
        inventoryPieceCount,
    };
}

export function getPieceCountWithTrait(
    piecesWithTraits: {
        pieceId: number;
        traits: string[];
        creature_index: number;
    }[],
    trait: string | undefined
) {
    // console.log("piecesWithTraits: ", piecesWithTraits);
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
