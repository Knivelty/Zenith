import { PhaserLayer } from "..";
import { prepare } from "./prepare";
import { controls } from "./controls";
import { mapSystem } from "./mapSystem";
import { camera } from "./camera";
import { battle } from "./battle";
import { health } from "./animation/health";
import { placeSystem } from "./local/placeSystem";
import { syncSystem } from "./local/syncSystem";
import { coordOccupationSystem } from "./local/coordOccupationSystem";
import { merge } from "./merge";
import { initialize } from "./initialize";
import { synergy } from "./animation/synergy";
import { followIndexSystem } from "./local/followIndexSystem";
import { entityStatusBar } from "./animation/entityStatusBar";

export const registerSystems = (layer: PhaserLayer) => {
    initialize(layer);
    prepare(layer);
    controls(layer);
    mapSystem(layer);
    camera(layer);
    battle(layer);
    // battleLog(layer);
    health(layer);
    synergy(layer);
    entityStatusBar(layer);

    merge(layer);

    // local component
    placeSystem(layer);
    syncSystem(layer);
    followIndexSystem(layer);
    coordOccupationSystem(layer);
};
