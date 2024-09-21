import { GameScene } from "./types";

export function definePhaserConfig(options: {
  scenes: GameScene[];
  scale: Phaser.Types.Core.GameConfig["scale"];
}): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.WEBGL,
    scale: options.scale,
    transparent: true,
    // pixelArt: false,
    // autoFocus: true,
    // antialias: false,
    // roundPixels: true,
    // antialiasGL: true,
    render: {
      antialiasGL: true,
      antialias: false,
      pixelArt: false,
      // transparent: true,
      // clearBeforeRender: true,
      // preserveDrawingBuffer: true,
      // transparent: true,
    },

    scene: options.scenes,
  };
}
