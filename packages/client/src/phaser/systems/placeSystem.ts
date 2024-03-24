import { Tileset } from "../../assets/world";
import { PhaserLayer } from "..";
import { snoise } from "@dojoengine/utils";
import { MAP_AMPLITUDE } from "../config/constants";

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
    } = layer;

    // input.$
    // input.pointermove$.subscribe({
    //     next(value) {
    //         console.log("pointermove: ", value.pointer.worldX);
    //     },
    // });

    // input.pointerdown$.subscribe({
    //     next(value) {
    //         console.log(
    //             "pointerdown: ",
    //             value.pointer.x,
    //             value.pointer.y
    //         );
    //     },
    // });
}
