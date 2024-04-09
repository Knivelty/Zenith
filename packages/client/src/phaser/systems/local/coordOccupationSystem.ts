import { PhaserLayer } from "../..";

import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import { Has, setComponent, updateComponent } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { logDebug } from "../../../ui/lib/utils";

export function coordOccupationSystem(layer: PhaserLayer) {
    const {
        networkLayer: {
            clientComponents: { LocalPiece, LocalPieceOccupation },
            account: { address },
        },
    } = layer;

    // follow local piece location
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            // unset prev occupation
            if (preV?.owner === BigInt(address)) {
                const occupiedEntity = getEntityIdFromKeys([
                    BigInt(preV.x),
                    BigInt(preV.y),
                ]);
                logDebug(`unset occupi ${preV.x}, ${preV.y}`);
                updateComponent(LocalPieceOccupation, occupiedEntity, {
                    x: preV.x,
                    y: preV.y,
                    occupied: false,
                });
            }

            // set current occupation
            if (v.owner === BigInt(address)) {
                const occupiedEntity = getEntityIdFromKeys([
                    BigInt(v.x),
                    BigInt(v.y),
                ]);

                logDebug(`set occupi ${v.x}, ${v.y}`);
                setComponent(LocalPieceOccupation, occupiedEntity, {
                    x: v.x,
                    y: v.y,
                    occupied: true,
                });
            }
        }
    );
}
