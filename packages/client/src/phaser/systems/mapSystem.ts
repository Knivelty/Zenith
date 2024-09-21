import { Tileset } from "../../assets/world";
import { PhaserLayer } from "..";

export function mapSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: {
                maps: {
                    Main: {
                        putTileAt,
                        setTileAlpha,
                        size,
                        tiles,
                        tileHeight,
                        tileWidth,
                    },
                },
            },
        },
    } = layer;

    for (let x = -1; x < 9; x++) {
        for (let y = -1; y < 9; y++) {
            if (x >= 0 && x <= 7 && y >= 0 && y <= 7) {
                continue;
            }
            const coord = { x, y };
            // Get a noise value between 0 and 100
            // const seed = Math.floor(
            //     ((snoise([x / MAP_AMPLITUDE, 0, y / MAP_AMPLITUDE]) + 1) / 2) *
            //         100
            // );

            putTileAt(coord, Tileset.Blank, "Background", 0x00ffffff);
            //
            // setTileAlpha(coord, "Background", 0);
        }
    }
}
