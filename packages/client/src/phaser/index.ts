import { createPhaserEngine } from "@latticexyz/phaserx";
import { NetworkLayer } from "../dojo/createNetworkLayer";
import { registerSystems } from "./systems/registerSystems";
import { namespaceWorld } from "@dojoengine/recs";
import { TILE_HEIGHT, TILE_WIDTH } from "./config/constants";
import { sleep } from "@latticexyz/utils";

export type PhaserLayer = Awaited<ReturnType<typeof createPhaserLayer>>;
type PhaserEngineConfig = Parameters<typeof createPhaserEngine>[0];

export const createPhaserLayer = async (
    networkLayer: NetworkLayer,
    phaserConfig: PhaserEngineConfig
) => {
    const world = namespaceWorld(networkLayer.recsWorld, "phaser");
    const {
        game,
        scenes,
        dispose: disposePhaser,
    } = await createPhaserEngine(phaserConfig);
    world.registerDisposer(disposePhaser);

    const { camera } = scenes.Main;

    camera.phaserCamera.setBounds(
        -1 * TILE_WIDTH,
        -1 * TILE_HEIGHT,
        TILE_WIDTH * 8,
        TILE_HEIGHT * 8
    );
    // camera.phaserCamera.centerOn(0, 0);
    camera.phaserCamera.centerOn(5 * TILE_WIDTH, 5 * TILE_HEIGHT);
    // camera.centerOnCoord({ x: 3, y: 3 }, TILE_WIDTH, TILE_HEIGHT);
    //
    camera.phaserCamera.setBackgroundColor("rgba(0,0,0,0)");
    const components = {};

    const layer = {
        networkLayer,
        world,
        game,
        scenes,
        components,
    };

    await sleep(1000);

    registerSystems(layer);

    // const render = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

    // const gl = render.gl;
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return layer;
};
