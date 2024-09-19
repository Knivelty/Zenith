import {
    Has,
    getComponentValueStrict,
    updateComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "../..";
import { defineSystemST, zeroEntity } from "../../../utils";
import { Assets, Sprites, TILE_HEIGHT } from "../../config/constants";
import { getPieceEntity } from "../../../ui/lib/utils";
import { update } from "lodash";

export const boardHint = (layer: PhaserLayer) => {
    const {
        world,
        networkLayer: {
            clientComponents: { Hint, UserOperation, LocalPiece, LocalPlayer },
            account,
            playerEntity,
        },
        scenes: {
            Main: { config, objectPool },
        },
    } = layer;

    defineSystemST<typeof UserOperation.schema>(
        world,
        [Has(UserOperation)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            if (v.dragging) {
                const piece = getComponentValueStrict(
                    LocalPiece,
                    getPieceEntity(v.draggingGid)
                );
                const playerV = getComponentValueStrict(
                    LocalPlayer,
                    playerEntity
                );

                if (piece.slot != 0 && playerV.heroesCount === playerV.level) {
                    updateComponent(Hint, zeroEntity, {
                        showBoardFull: true,
                        showBoardNotFull: false,
                    });
                } else {
                    updateComponent(Hint, zeroEntity, {
                        showBoardNotFull: true,
                        showBoardFull: false,
                    });
                }
            } else {
                updateComponent(Hint, zeroEntity, {
                    showBoardFull: false,
                    showBoardNotFull: false,
                });
            }
        }
    );

    defineSystemST<typeof Hint.schema>(
        world,
        [Has(Hint)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            const boardHintEntity = "boardFullHint";
            const boardHint = objectPool.get(boardHintEntity, "Sprite");

            const shouldNotShow = !v.showBoardFull && !v.showBoardNotFull;

            if (shouldNotShow) {
                objectPool.remove(boardHintEntity);
            } else {
                const boardHintSprite =
                    config.sprites[
                        v.showBoardFull
                            ? Sprites.BoardFull
                            : Sprites.BoardNotFull
                    ];

                boardHint.setComponent({
                    id: boardHintEntity,
                    now: (sprite) => {
                        sprite.setTexture(
                            boardHintSprite.assetKey,
                            boardHintSprite.frame
                        );
                        sprite.setPosition(0, 4 * TILE_HEIGHT);

                        sprite.setScale((4 * TILE_HEIGHT) / sprite.height);
                    },
                });
            }
        }
    );
};
