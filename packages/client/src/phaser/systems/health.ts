import { Has } from "@dojoengine/recs";
import { defineSystemST } from "../../utils";
import { PhaserLayer } from "..";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
    HealthBarOffSetX,
    HealthBarOffSetY,
    Sprites,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../config/constants";

export const health = (layer: PhaserLayer) => {
    const {
        world,
        scenes: {
            Main: { config, objectPool },
        },
        networkLayer: {
            clientComponents: {
                Piece,
                GameStatus,
                InningBattle,
                Player,
                BattleLogs,
                HealthBar,
            },
            account,
            graphqlClient,
        },
    } = layer;

    defineSystemST<typeof HealthBar.schema>(
        world,
        [Has(HealthBar)],
        ({ entity, type, value: [v, preV] }) => {
            console.log("update on health bar");
            if (!v) {
                return;
            }

            const healthBar = objectPool.get(entity, "Sprite");

            healthBar.setComponent({
                id: entity,
                now: async (rec: Phaser.GameObjects.Sprite) => {
                    const healthBar = config.sprites[Sprites.HealthBar];

                    rec.setTexture(healthBar.assetKey, healthBar.frame);
                    // rec.setLineWidth(TILE_WIDTH);
                    rec.setPosition(v.x, v.y - HealthBarOffSetY);
                    // rec.setDepth(10);

                    rec.setScale(10);
                },
            });
        }
    );
};
