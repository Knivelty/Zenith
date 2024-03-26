import { Tileset } from "../../../assets/world";
import { PhaserLayer } from "../..";
import { snoise } from "@dojoengine/utils";
import { MAP_AMPLITUDE } from "../../config/constants";
import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import {
    Has,
    getComponentValue,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";

export function syncSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: {
                maps: {
                    Main: { putTileAt },
                },
                phaserScene,
                input,
            },
        },
        networkLayer: {
            clientComponents: {
                Player,
                LocalPlayer,
                Piece,
                LocalPiece,
                PlayerPiece,
                LocalPlayerPiece,
                PlayerInvPiece,
                LocalPlayerInvPiece,
                LocalPiecesChangeTrack,
            },
            playerEntity,
            account: { address },
        },
    } = layer;

    // sync inventory if buy or sell
    defineSystemST<typeof PlayerInvPiece.schema>(
        world,
        [Has(PlayerInvPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            // TODO: allow inv drag and find accurate slot
            setComponent(LocalPlayerInvPiece, entity, v);
        }
    );

    // sync local player piece on init
    defineSystemST<typeof PlayerPiece.schema>(
        world,
        [Has(PlayerPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            // TODO: allow inv drag and find accurate slot
            setComponent(LocalPlayerPiece, entity, v);
        }
    );

    // sync player
    defineSystemST<typeof Player.schema>(
        world,
        [Has(Player)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            // TODO: resolve conflict case by case
            setComponent(LocalPlayer, entity, v);
        }
    );

    // sync piece
    defineSystemST<typeof Piece.schema>(
        world,
        [Has(Piece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            setComponent(LocalPiece, entity, v);

            // add the gid to local pieces track
            const piecesTrack = getComponentValue(
                LocalPiecesChangeTrack,
                playerEntity
            );

            if (v.owner == BigInt(address)) {
                if (piecesTrack) {
                    const gids = piecesTrack.gids;
                    console.log("gids: ", piecesTrack, gids);
                    gids.push(v.gid);
                    updateComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: [...new Set(gids)],
                    });
                } else {
                    console.log("init: ", [v.gid]);
                    setComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: [v.gid],
                    });
                }
            }

            // piece sold, remove from array
            if (preV?.owner === BigInt(address) && v.owner === 0n) {
                // TODO: remove gids when user sell this piece

                if (piecesTrack) {
                    const gids = piecesTrack.gids;
                    updateComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: gids.filter((x) => x !== v.gid),
                    });
                }
            }
        }
    );
}
