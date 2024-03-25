import { Tileset } from "../../../assets/world";
import { PhaserLayer } from "../..";
import { snoise } from "@dojoengine/utils";
import { MAP_AMPLITUDE } from "../../config/constants";
import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import { Has } from "@dojoengine/recs";
import { utils } from "../utils";

export function placeSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: {
                maps: {
                    Main: { putTileAt },
                },
                phaserScene,
                input,
            },
        },
        networkLayer: {
            clientComponents: { LocalPiece, LocalPlayerPiece },
        },
    } = layer;

    const { spawnPiece } = utils(layer);

    // follow local piece location
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            spawnPiece(v.owner, BigInt(v.idx));
        }
    );

    input.drag$.subscribe({
        next(value) {
            console.log("value: ", value);

            // get start point piece
        },
    });
}
