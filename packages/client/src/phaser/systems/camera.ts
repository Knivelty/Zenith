import { PhaserLayer } from "..";

export const camera = (layer: PhaserLayer) => {
    const {
        scenes: {
            Main: {
                camera: { phaserCamera },
            },
        },
    } = layer;

    phaserCamera.centerOn(0, 0);
    phaserCamera.setZoom(0.3125);
};
