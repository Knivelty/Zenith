import { useEntityQuery } from "@dojoengine/react";
import { useDojo } from "./useDojo";
import { HasValue, NotValue } from "@dojoengine/recs";
import { utf8StringToBigInt } from "../../utils";
import { getAllSynergies } from "./useAllSynergies";
import { getTraitPieceCount } from "./usePieceCountWithTrait";
import { useMemo } from "react";
import * as R from "ramda";

export function useOneSynergyDetail(traitName: string) {
    const {
        clientComponents: { SynergyProfile, LocalPiece },
        clientComponents,
        account: {
            account: { address },
        },
    } = useDojo();

    // const profileEntities = useEntityQuery([
    //     HasValue(SynergyProfile, { trait_name: utf8StringToBigInt(traitName) }),
    // ]);
    const allSynergies = getAllSynergies(SynergyProfile);
    const onBoardPieceEntities = useEntityQuery([
        HasValue(LocalPiece, { owner: BigInt(address) }),
        NotValue(LocalPiece, { idx: 0 }),
    ]);

    const inventoryPieceEntities = useEntityQuery([
        HasValue(LocalPiece, { owner: BigInt(address) }),
        NotValue(LocalPiece, { slot: 0 }),
    ]);

    const synergyDetail = useMemo(() => {
        const counts = getTraitPieceCount({
            clientComponents,
            traitName,
            onBoardPieceEntities,
            inventoryPieceEntities,
        });

        const requiredPieceCounts = allSynergies[traitName];

        const unlockLevel =
            requiredPieceCounts?.reduce((accumulator, currentValue) => {
                if (currentValue.requiredPieces <= counts.onBoardPieceCount) {
                    return accumulator + 1;
                }
                return accumulator;
            }, 0) || 0;

        const coresCount =
            unlockLevel >= 1
                ? requiredPieceCounts?.[unlockLevel - 1].requiredPieces
                : undefined;

        return {
            ...counts,
            traitName,
            requiredPieceCounts,
            unlockLevel,
            coresCount,
        };
    }, [
        traitName,
        allSynergies,
        clientComponents,
        onBoardPieceEntities,
        inventoryPieceEntities,
    ]);

    return { synergyDetail };
}
