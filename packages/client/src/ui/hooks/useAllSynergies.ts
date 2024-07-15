import { useDojo } from "./useDojo";
import { getComponentValueStrict, HasValue, NotValue } from "@dojoengine/recs";
import { toUtf8String } from "ethers/lib/utils";
import { groupBy, prop, sortBy } from "ramda";
import { ClientComponents } from "../../dojo/createClientComponents";
import { getTraitPieceCount } from "./usePieceCountWithTrait";
import { useMemo } from "react";
import { useEntityQuery } from "@dojoengine/react";
import * as R from "ramda";

export interface ISynergyStatus {
    synergyEntity: string;
}

export function useAllSynergiesCounts() {
    const {
        clientComponents: { SynergyProfile, LocalPiece },
        clientComponents,
        account: {
            account: { address },
        },
    } = useDojo();

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
        const details = Object.keys(allSynergies)?.map((traitName: string) => {
            const counts = getTraitPieceCount({
                clientComponents,
                traitName,
                onBoardPieceEntities,
                inventoryPieceEntities,
            });

            const requiredPieceCounts = allSynergies[traitName];

            const unlockLevel =
                requiredPieceCounts?.reduce((accumulator, currentValue) => {
                    if (
                        currentValue.requiredPieces <= counts.onBoardPieceCount
                    ) {
                        return accumulator + 1;
                    }
                    return accumulator;
                }, 0) || 0;

            return {
                ...counts,
                traitName,
                requiredPieceCounts,
                unlockLevel,
            };
        });

        // sort by unlock Level and count
        return R.sortWith(
            [
                R.descend(R.prop("unlockLevel")),
                R.descend(R.prop("onBoardPieceCount")),
                R.ascend(R.prop("traitName")),
            ],
            details
        );
    }, [
        allSynergies,
        clientComponents,
        onBoardPieceEntities,
        inventoryPieceEntities,
    ]);

    return synergyDetail;
}

export function getAllSynergies(
    SynergyProfile: ClientComponents["SynergyProfile"]
) {
    const allEntities = SynergyProfile.entities();

    const allSynergies: {
        trait_name: string;
        requiredPieces: number;
    }[] = [];

    for (const entity of allEntities) {
        const profile = getComponentValueStrict(SynergyProfile, entity);

        allSynergies.push({
            trait_name: toUtf8String("0x" + profile.trait_name.toString(16)),
            requiredPieces: profile.requiredPieces,
        });
    }

    const sortedGroupedSynergy = groupBy(
        prop("trait_name"),
        sortBy(prop("requiredPieces"), allSynergies)
    );

    return sortedGroupedSynergy;
}
