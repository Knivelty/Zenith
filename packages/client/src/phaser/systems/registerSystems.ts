import { PhaserLayer } from "..";
import { prepare } from "./prepare";
import { controls } from "./controls";
import { mapSystem } from "./mapSystem";
import { camera } from "./camera";
import { battle } from "./battle";
import { health } from "./health";
import { attack } from "./attack";
import { placeSystem } from "./local/placeSystem";
import { syncSystem } from "./local/syncSystem";
import { coordOccupationSystem } from "./local/coordOccupationSystem";
import { followIndexSystem } from "./local/followIndexSystem";

export const registerSystems = (layer: PhaserLayer) => {
    prepare(layer);
    controls(layer);
    mapSystem(layer);
    camera(layer);
    battle(layer);
    // battleLog(layer);
    health(layer);
    attack(layer);

    // local component
    placeSystem(layer);
    syncSystem(layer);
    followIndexSystem(layer);
    coordOccupationSystem(layer);
};
