import {
    Entity,
    Has,
    getComponentValueStrict,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { PhaserLayer } from "../..";
import { TILE_HEIGHT, TILE_WIDTH } from "../../config/constants";

export const utils = (layer: PhaserLayer) => {
    const {
        game,
        scenes: {
            Main: { config, objectPool, input },
        },
        networkLayer: {
            clientComponents: {
                HealthBar,
                Health,
                CreatureProfile,
                LocalPlayerPiece,
                LocalPiece,
            },
            account,
        },
    } = layer;

    function spawnPiece(playerAddr: bigint, index: bigint) {
        const playerPiece = getComponentValueStrict(
            LocalPlayerPiece,
            getEntityIdFromKeys([playerAddr, index])
        );

        const entity = getEntityIdFromKeys([BigInt(playerPiece.gid)]);

        const piece = getComponentValueStrict(LocalPiece, entity);

        let piecePosition = { x: piece.x, y: piece.y };

        // if enemy, convert coord
        if (BigInt(account.address) !== piece.owner) {
            piecePosition = {
                x: 8 - piecePosition.x,
                y: piecePosition.y,
            };
        }

        const pixelPosition = tileCoordToPixelCoord(
            piecePosition,
            TILE_WIDTH,
            TILE_HEIGHT
        );

        const hero = objectPool.get(entity, "Sprite");

        hero.setComponent({
            id: entity,
            now: (sprite: Phaser.GameObjects.Sprite) => {
                sprite.setPosition(pixelPosition.x, pixelPosition.y);

                sprite.play(config.animations[piece.creature_index]);
                sprite.setInteractive();

                // TODO: use lossless scale method
                const scale = TILE_WIDTH / sprite.width;
                sprite.setScale(scale);

                game.scene.getScene("Main")?.input.setDraggable(sprite);
            },
        });

        // initialize health bar
        setComponent(HealthBar, `${entity}-health-bar` as Entity, {
            x: pixelPosition.x,
            y: pixelPosition.y,
            percentage: 100,
        });

        const creature = getComponentValueStrict(
            CreatureProfile,
            getEntityIdFromKeys([
                BigInt(piece.creature_index),
                BigInt(piece.level),
            ])
        );

        // initialize health
        setComponent(Health, `${entity}-health` as Entity, {
            max: creature.health * piece.level,
            current: creature.health * piece.level,
            pieceEntity: entity,
        });
    }

    return { spawnPiece };
};
