import { PhaserLayer } from "../..";
import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import {
    Has,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { logDebug, logPieceIdx } from "../../../ui/lib/utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export function followIndexSystem(layer: PhaserLayer) {
    const {
        networkLayer: {
            clientComponents: {
                LocalPiece,
                LocalPlayerInvPiece,
                LocalPlayerPiece,
                LocalPlayer,
            },
            account: { address },
            playerEntity,
        },
    } = layer;

    // local player piece and local player inv piece should follow local piece change
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            // don't care piece which doesn't belong to player
            if (v.owner !== BigInt(address)) {
                return;
            }

            const player = getComponentValueStrict(LocalPlayer, playerEntity);

            const localInvPieceEntity = getEntityIdFromKeys([
                v.owner,
                BigInt(v.slot),
            ]);

            const localPlayerPieceEntity = getEntityIdFromKeys([
                v.owner,
                BigInt(v.idx),
            ]);

            // if no previous value, it could be buy event or new sync
            if (!preV) {
                if (v.slot === 0 && v.gid === 0) {
                    throw Error("sync local piece logic error");
                }

                if (v.slot !== 0) {
                    setComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                        owner: v.owner,
                        slot: v.slot,
                        gid: v.gid,
                    });
                } else if (v.idx !== 0) {
                    setComponent(LocalPlayerPiece, localPlayerPieceEntity, {
                        owner: v.owner,
                        idx: v.idx,
                        gid: v.gid,
                    });
                }

                return;
            }

            const preLocalInvPieceEntity = getEntityIdFromKeys([
                v.owner,
                BigInt(preV.slot),
            ]);

            const preLocalPlayerPieceEntity = getEntityIdFromKeys([
                v.owner,
                BigInt(preV.idx),
            ]);

            if (
                preV.slot !== 0 &&
                v.slot !== 0 &&
                preV.idx === 0 &&
                preV.idx === 0
            ) {
                /**
                 * @dev piece move between two different inventory slots
                 */

                logPieceIdx(
                    `piece ${v.gid} move from slot ${preV.slot} to slot ${v.slot}`
                );

                // update prev slot
                updateComponent(LocalPlayerInvPiece, preLocalInvPieceEntity, {
                    gid: 0,
                });
                // update new slot
                if (
                    !getComponentValue(LocalPlayerInvPiece, localInvPieceEntity)
                ) {
                    setComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                        owner: v.owner,
                        slot: v.slot,
                        gid: v.gid,
                    });
                } else {
                    updateComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                        gid: v.gid,
                    });
                }
            } else if (
                preV.slot !== 0 &&
                v.slot === 0 &&
                preV.idx === 0 &&
                v.idx !== 0
            ) {
                /**
                 * @dev piece move from inventory to board
                 */
                logPieceIdx(
                    `piece ${v.gid} move from ${preV.slot} to ${v.idx}`
                );

                // update local player's hero count and inv count
                updateComponent(LocalPlayer, playerEntity, {
                    heroesCount: player.heroesCount + 1,
                    inventoryCount: player.inventoryCount - 1,
                });

                // update prev slot
                updateComponent(LocalPlayerInvPiece, preLocalInvPieceEntity, {
                    gid: 0,
                });
                // update new board index
                const preVPlayerPiece = getComponentValue(
                    LocalPlayerPiece,
                    localPlayerPieceEntity
                );
                if (!preVPlayerPiece) {
                    logDebug(
                        `set local player piece ${localPlayerPieceEntity}`
                    );
                    setComponent(LocalPlayerPiece, localPlayerPieceEntity, {
                        owner: v.owner,
                        idx: v.idx,
                        gid: v.gid,
                    });
                } else {
                    logDebug(
                        `set local player piece ${localPlayerPieceEntity} ${v.gid}`
                    );
                    updateComponent(LocalPlayerPiece, localPlayerPieceEntity, {
                        gid: v.gid,
                    });
                }
            } else if (
                preV.idx !== 0 &&
                v.idx === 0 &&
                preV.slot === 0 &&
                v.slot !== 0
            ) {
                /**
                 * @dev piece move from board to inventory
                 */
                logPieceIdx(
                    `piece ${v.gid} move from ${preV.idx} to ${v.slot}`
                );

                // update local player's hero count and inv count
                updateComponent(LocalPlayer, playerEntity, {
                    heroesCount: player.heroesCount - 1,
                    inventoryCount: player.inventoryCount + 1,
                });

                // update prev board index
                updateComponent(LocalPlayerPiece, preLocalPlayerPieceEntity, {
                    gid: 0,
                });

                // update new inventory slot
                if (
                    !getComponentValue(LocalPlayerInvPiece, localInvPieceEntity)
                ) {
                    setComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                        owner: v.owner,
                        slot: v.slot,
                        gid: v.gid,
                    });
                } else {
                    updateComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                        gid: v.gid,
                    });
                }
            } else if (
                preV.idx === 0 &&
                preV.slot !== 0 &&
                v.idx === 0 &&
                v.slot === 0
            ) {
                /**
                 * @dev piece sold
                 */
                // update prev inventory index
                updateComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                    gid: 0,
                });

                // update local player's hero count and inv count
                updateComponent(LocalPlayer, playerEntity, {
                    heroesCount: player.heroesCount - 1,
                    inventoryCount: player.inventoryCount + 1,
                });
            } else if (
                preV.idx !== 0 &&
                v.idx !== 0 &&
                preV.slot === 0 &&
                v.slot === 0
            ) {
                /**
                 * @dev player piece index change
                 */
                logDebug(
                    `player piece ${v.gid} change from ${preV.idx} to ${v.idx}`
                );
                // just update player piece
                updateComponent(LocalPlayerPiece, preLocalPlayerPieceEntity, {
                    gid: 0,
                });

                updateComponent(LocalPlayerPiece, localPlayerPieceEntity, {
                    gid: v.gid,
                });
            }
        }
    );
}
