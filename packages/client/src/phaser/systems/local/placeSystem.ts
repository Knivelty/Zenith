import { Tileset } from "../../../assets/world";
import { PhaserLayer } from "../..";
import { snoise } from "@dojoengine/utils";
import { MAP_AMPLITUDE } from "../../config/constants";
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
        },
    } = layer;

    const { spawnPiece, removePieceOnBoard } = utils(layer);

    // follow local piece location
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (
                v &&
                (type === UpdateType.Enter || type === UpdateType.Update)
            ) {
                console.log("v: ", v, "preV: ", preV, "type: ", type);
                if (v.owner !== 0n && v.idx !== 0) {
                    console.log("place")
                    spawnPiece(v.owner, BigInt(v.idx));
                } else {
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
