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
import {
    getPieceEntity,
    getPlayerBoardPieceEntity,
    logDebug,
    logPieceIdx,
} from "../../../ui/lib/utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { localPlayerInv } from "../utils/localPlayerInv";
import { isEqual } from "lodash";

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

    const { getFirstEmptyLocalInvSlot } = localPlayerInv(layer);

    // local player piece and local player inv piece should follow local piece change
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }
            // ignore the update without value change
            if (isEqual(v, preV)) {
                return;
            }

            // don't care piece which doesn't belong to player
            if (
                v.owner !== BigInt(address) &&
                preV?.owner !== BigInt(address)
            ) {
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

            // if no previous value, it could be buy/merge event or new sync
            if (!preV) {
                if (v.slot === 0 && v.gid === 0) {
                    throw Error("sync local piece logic error");
                }
                logDebug("sync localPiece without prev value", v);

                if (v.slot !== 0) {
                    // it's a buy event
                    // check whether is occupied on frontend

                    const lpip = getComponentValue(
                        LocalPlayerInvPiece,
                        getEntityIdFromKeys([BigInt(address), BigInt(v.slot)])
                    );

                    // if not occupied, set
                    if (!lpip || lpip.gid === 0) {
                        logDebug(`not occupied, set slot ${v.slot}`);
                        setComponent(LocalPlayerInvPiece, localInvPieceEntity, {
                            owner: v.owner,
                            slot: v.slot,
                            gid: v.gid,
                        });
                    } else {
                        if (lpip.gid === v.gid) {
                            logDebug("local inv slot already set");
                            return;
                        }

                        const slot = getFirstEmptyLocalInvSlot();
                        logDebug(`occupied, try set to slot ${slot}`);

                        if (slot !== 0) {
                            setComponent(
                                LocalPlayerInvPiece,
                                getEntityIdFromKeys([
                                    BigInt(address),
                                    BigInt(slot),
                                ]),
                                {
                                    owner: BigInt(address),
                                    slot: slot,
                                    gid: v.gid,
                                }
                            );
                        } else {
                            console.error("place logic error");
                        }
                    }
                } else if (v.idx !== 0) {
                    // it could be a merge event
                    setComponent(LocalPlayerPiece, localPlayerPieceEntity, {
                        owner: v.owner,
                        idx: v.idx,
                        gid: v.gid,
                    });

                    updateComponent(LocalPlayer, playerEntity, {
                        heroesCount: player.heroesCount + 1,
                    });
                } else {
                    logDebug("uncaught case");
                }

                return;
            }

            const preLocalInvPieceEntity = getEntityIdFromKeys([
                preV.owner,
                BigInt(preV.slot),
            ]);

            const preLocalPlayerPieceEntity = getEntityIdFromKeys([
                preV.owner,
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
                    `piece ${v.gid} move from slot ${preV.slot} to index ${v.idx} pos ${v.x} ${v.y}`
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
                 * @dev piece in inventory sold or be merged
                 */
                logPieceIdx(`piece ${v.gid} sold or merged from inventory`);
                // update prev inventory index
                updateComponent(LocalPlayerInvPiece, preLocalInvPieceEntity, {
                    gid: 0,
                });

                // update local player's inv count
                updateComponent(LocalPlayer, playerEntity, {
                    inventoryCount: player.inventoryCount - 1,
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
                logPieceIdx(
                    `player piece ${v.gid} on board index change from ${preV.idx} to ${v.idx}`
                );

                if (preV.idx === player.heroesCount) {
                    updateComponent(
                        LocalPlayerPiece,
                        preLocalPlayerPieceEntity,
                        {
                            gid: 0,
                        }
                    );
                }

                // TODO: don't know why update may fail
                setComponent(LocalPlayerPiece, localPlayerPieceEntity, {
                    gid: v.gid,
                    owner: v.owner,
                    idx: v.idx,
                });
            } else if (
                preV.idx !== 0 &&
                v.idx == 0 &&
                preV.slot === 0 &&
                v.slot === 0
            ) {
                /**
                 * @dev piece on board merged or sold
                 */
                logPieceIdx(
                    `piece ${v.gid} on ${preV.idx} merged or sold from board`
                );

                // just follow on chain change because on chain do a lot of things

                // if this piece is last piece, clear that player piece

                if (preV.idx === player.heroesCount) {
                    updateComponent(
                        LocalPlayerPiece,
                        preLocalPlayerPieceEntity,
                        {
                            gid: 0,
                        }
                    );
                }

                // update local player's hero count
                updateComponent(LocalPlayer, playerEntity, {
                    heroesCount: player.heroesCount - 1,
                });
            } else {
                logPieceIdx("uncaught case", preV, v);
            }
        }
    );
}
