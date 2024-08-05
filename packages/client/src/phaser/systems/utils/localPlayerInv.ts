import {
    getComponentValueStrict,
    HasValue,
    NotValue,
    runQuery,
} from "@dojoengine/recs";
import { PhaserLayer } from "../..";
import { getFirstEmptySlot } from "../../../ui/hooks/useInv";

export const localPlayerInv = (layer: PhaserLayer) => {
    const {
        networkLayer: {
            clientComponents: { LocalPiece },
            account: { address },
        },
    } = layer;

    function getFirstEmptyLocalInvSlot() {
        const pieceEntities = runQuery([
            HasValue(LocalPiece, { owner: BigInt(address) }),
            NotValue(LocalPiece, { slot: 0 }),
        ]);

        const invGids = Array(6).fill(undefined);

        Array.from(pieceEntities).forEach((pieceEntity) => {
            const p = getComponentValueStrict(LocalPiece, pieceEntity);

            invGids[p.slot - 1] = p.gid;
        });

        return getFirstEmptySlot(invGids);
    }

    return { getFirstEmptyLocalInvSlot };
};
