import { PhaserLayer } from "..";
import { move } from "./move";
import { controls } from "./controls";
import { mapSystem } from "./mapSystem";
import { camera } from "./camera";
import { battleLog } from "./battleLog";

export const registerSystems = (layer: PhaserLayer) => {
    move(layer);
    controls(layer);
    mapSystem(layer);
    camera(layer);
    // battleLog(layer);
};
