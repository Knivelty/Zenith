import { PhaserLayer } from "../..";

import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import { Has, UpdateType } from "@dojoengine/recs";
import { utils } from "../utils";

export function placeSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: { input },
        },
        networkLayer: {
            clientComponents: { LocalPiece, LocalPlayerPiece },
            account: { address },
        },
    } = layer;

    const { spawnPiece, removePieceOnBoard } = utils(layer);

    // follow local piece location
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (v) {
                // only dynamic sync player's piece
                if (v.owner == BigInt(address) && v.idx !== 0) {
                    console.log("place: ", v.owner, v.idx);
                    spawnPiece(v.owner, BigInt(v.idx));
                }
                if (v.owner === 0n) {
                    removePieceOnBoard(v.gid);
                }
            }
        }
    );

    input.drag$.subscribe({
        next(value) {
            // console.log("value: ", value);
            // get start point piece
        },
    });
}
