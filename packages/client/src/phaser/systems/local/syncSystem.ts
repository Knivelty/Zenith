import { PhaserLayer } from "../..";
import { getEntityIdFromKeys, snoise } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import {
    Has,
    getComponentValue,
    removeComponent,
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
                GameStatus,
                InningBattle,
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

            const status = getComponentValue(GameStatus, zeroEntity);
            const inningBattle = getComponentValue(
                InningBattle,
                getEntityIdFromKeys([
                    BigInt(status?.currentMatch || 0),
                    BigInt(status?.currentRound || 0),
                ])
            );

            // sync relevant piece
            if (
                v.owner == BigInt(address) ||
                v.owner == inningBattle?.awayPlayer ||
                // zero means piece removed
                v.owner === 0n
            ) {
                setComponent(LocalPiece, entity, v);
            }

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
            if (preV?.owner !== 0n && v.owner === 0n) {
                // TODO: remove gids when user sell this piece

                console.log("remove: ", v.gid);

                if (piecesTrack) {
                    const gids = piecesTrack.gids;
                    updateComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: [...new Set(gids.filter((x) => x !== v.gid))],
                    });
                }

                // remove the local piece entity
                const pEntity = getEntityIdFromKeys([BigInt(v.gid)]);
                removeComponent(LocalPiece, pEntity);
            }
        }
    );
}
