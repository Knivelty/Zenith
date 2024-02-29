import { PhaserLayer } from "..";
import { prepare } from "./prepare";
import { controls } from "./controls";
import { mapSystem } from "./mapSystem";
import { camera } from "./camera";
import { battle } from "./battle";
import { health } from "./health";

export const registerSystems = (layer: PhaserLayer) => {
    prepare(layer);
    controls(layer);
    mapSystem(layer);
    camera(layer);
    battle(layer);
    // battleLog(layer);
    health(layer);
};
