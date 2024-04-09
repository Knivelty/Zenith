import { PhaserLayer } from "../..";

import { defineSystemST, zeroEntity } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import { Has, getComponentValueStrict } from "@dojoengine/recs";
import { utils } from "../utils";
import { logDebug } from "../../../ui/lib/utils";

export function placeSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: { input },
        },
        networkLayer: {
            clientComponents: { LocalPiece, GameStatus },
            account: { address },
        },
    } = layer;

    const { spawnPiece, removePieceOnBoard } = utils(layer);

    // follow local piece location
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            logDebug("v:", v);
            const status = getComponentValueStrict(GameStatus, zeroEntity);
            if (v) {
                // only dynamic sync player's piece
                if (v.owner === BigInt(address) && v.idx !== 0) {
                    console.log("place: ", v, v.owner, v.idx);
                    spawnPiece(v.owner, BigInt(v.idx));
                }
                if (v.owner === 0n) {
                    removePieceOnBoard(v.gid);
                }
                if (v.idx === 0) {
                    // wait for op render override remove
                    setTimeout(() => {
                        if (v.idx === 0) {
                            removePieceOnBoard(v.gid);
                        }
                    }, 500);
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
