import { Tileset } from "../../assets/world";
import { PhaserLayer } from "..";
import { snoise } from "@dojoengine/utils";
import { MAP_AMPLITUDE } from "../config/constants";

export function mapSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: {
                maps: {
                    Main: { putTileAt },
                },
            },
        },
    } = layer;

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const coord = { x, y };
            // Get a noise value between 0 and 100
            // const seed = Math.floor(
            //     ((snoise([x / MAP_AMPLITUDE, 0, y / MAP_AMPLITUDE]) + 1) / 2) *
            //         100
            // );

            putTileAt(coord, Tileset.Land, "Foreground");
        }
    }
}
