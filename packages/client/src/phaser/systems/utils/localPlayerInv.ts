import { getComponentValue } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { PhaserLayer } from "../..";

export const localPlayerInv = (layer: PhaserLayer) => {
    const {
        networkLayer: {
            clientComponents: { LocalPlayerInvPiece },
            account: { address },
        },
    } = layer;

    function getFirstEmptyLocalInvSlot() {
        const inv1 = getComponentValue(
            LocalPlayerInvPiece,
            getEntityIdFromKeys([BigInt(address), 1n])
        );
        const inv2 = getComponentValue(
            LocalPlayerInvPiece,
            getEntityIdFromKeys([BigInt(address), 2n])
        );
        const inv3 = getComponentValue(
            LocalPlayerInvPiece,
            getEntityIdFromKeys([BigInt(address), 3n])
        );
        const inv4 = getComponentValue(
            LocalPlayerInvPiece,
            getEntityIdFromKeys([BigInt(address), 4n])
        );
        const inv5 = getComponentValue(
            LocalPlayerInvPiece,
            getEntityIdFromKeys([BigInt(address), 5n])
        );
        const inv6 = getComponentValue(
            LocalPlayerInvPiece,
            getEntityIdFromKeys([BigInt(address), 6n])
        );

        const invGids = [
            inv1?.gid,
            inv2?.gid,
            inv3?.gid,
            inv4?.gid,
            inv5?.gid,
            inv6?.gid,
        ];

        console.log("invGids: ", invGids);

        const emptySlots = invGids
            .map((item, index) =>
                item == 0 || item == undefined ? index + 1 : undefined
            )
            .filter((index) => index !== undefined) as number[];

        return emptySlots.length ? emptySlots[0] : 0;
    }

    return { getFirstEmptyLocalInvSlot };
};
