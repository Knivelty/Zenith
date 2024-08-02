import { PhaserLayer } from "../..";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import {
    Has,
    getComponentValue,
    removeComponent,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { localPlayerInv } from "../utils/localPlayerInv";
import { logDebug } from "../../../ui/lib/utils";

export function syncSystem(layer: PhaserLayer) {
    const {
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
                MatchState,
            },
            playerEntity,
            account: { address },
        },
    } = layer;

    const { getFirstEmptyLocalInvSlot } = localPlayerInv(layer);

    // defineSystemST<typeof PlayerInvPiece.schema>(
    //     world,
    //     [Has(PlayerInvPiece)],
    //     ({ entity, type, value: [v, preV] }) => {
    //         if (!v) {
    //             return;
    //         }
    //         // TODO: allow inv drag and find accurate slot

    //         // ignore irrelevant piece
    //         if (
    //             v.owner !== BigInt(address) &&
    //             preV?.owner !== BigInt(address)
    //         ) {
    //             return;
    //         }

    //         // delete player inv piece operation
    //         if (v.gid === 0) {
    //             setComponent(LocalPlayerInvPiece, entity, v);
    //             return;
    //         }

    //         // TODO: check whether it works or not
    //         // check whether is occupied on frontend

    //         const lpip = getComponentValue(
    //             LocalPlayerInvPiece,
    //             getEntityIdFromKeys([BigInt(address), BigInt(v.slot)])
    //         );

    //         // if not occupied, set
    //         if (!lpip || lpip.gid === 0) {
    //             logDebug(`not occupied, set slot ${v.slot}`);
    //             setComponent(LocalPlayerInvPiece, entity, v);
    //         } else {
    //             if (lpip.gid === v.gid) {
    //                 logDebug("already set");
    //                 return;
    //             }

    //             const slot = getFirstEmptyLocalInvSlot();
    //             logDebug(`occupied, try set to slot ${slot}`);

    //             if (slot !== 0) {
    //                 setComponent(
    //                     LocalPlayerInvPiece,
    //                     getEntityIdFromKeys([BigInt(address), BigInt(slot)]),
    //                     {
    //                         owner: BigInt(address),
    //                         slot: slot,
    //                         gid: v.gid,
    //                     }
    //                 );
    //             } else {
    //                 console.error("place logic error");
    //             }
    //         }
    //     }
    // );

    // only sync non-player local player piece
    defineSystemST<typeof PlayerPiece.schema>(
        world,
        [Has(PlayerPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            if (v.owner === BigInt(address)) {
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

            const localP = getComponentValue(LocalPlayer, playerEntity);

            if (entity === playerEntity) {
                // don't heroes count calculate locally and don't follow on chain number
                if (!localP) {
                    // TODO: resolve conflict case by case
                    setComponent(LocalPlayer, entity, { ...v, heroesCount: 0 });
                } else {
                    updateComponent(LocalPlayer, entity, {
                        ...v,
                        heroesCount: localP.heroesCount,
                    });
                }
            } else {
                // update all other player
                setComponent(LocalPlayer, entity, v);
            }
        }
    );

    // sync piece
    defineSystemST<typeof Piece.schema>(
        world,
        [Has(Piece)],
        async ({ entity, type, value: [v, preV] }) => {
            logDebug(`incoming Piece Change`, v, preV);

            if (v) {
                // sync all kinds of values
                const oldValue = getComponentValue(LocalPiece, entity);
                if (!oldValue) {
                    setComponent(LocalPiece, entity, v);
                } else {
                    updateComponent(LocalPiece, entity, v);
                }
            }

            // add the gid to local pieces track
            const piecesTrack = getComponentValue(
                LocalPiecesChangeTrack,
                playerEntity
            );

            if (v?.owner === BigInt(address)) {
                if (piecesTrack) {
                    const gids = piecesTrack.gids;
                    logDebug("gids: ", piecesTrack, gids);
                    gids.push(v.gid);
                    updateComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: [...new Set(gids)],
                    });
                } else {
                    logDebug("init piece track, add", [v.gid]);
                    setComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: [v.gid],
                    });
                }
            }

            // piece sold, remove from track array
            if (preV && preV?.owner !== 0n && (!v || v.owner === 0n)) {
                // TODO: remove gids when user sell this piece

                if (piecesTrack) {
                    const gids = piecesTrack.gids;
                    updateComponent(LocalPiecesChangeTrack, playerEntity, {
                        gids: [...new Set(gids.filter((x) => x !== preV.gid))],
                    });
                }

                // remove the local piece entity
                const pEntity = getEntityIdFromKeys([BigInt(preV?.gid)]);
                removeComponent(LocalPiece, pEntity);
            }
        }
    );
}
