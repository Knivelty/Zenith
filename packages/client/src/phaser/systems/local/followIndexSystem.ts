import { PhaserLayer } from "../..";
import { defineSystemST } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import {
    Has,
    HasValue,
    NotValue,
    getComponentValueStrict,
    runQuery,
    updateComponent,
} from "@dojoengine/recs";
import { getPieceEntity, logDebug, logPieceIdx } from "../../../ui/lib/utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { localPlayerInv } from "../utils/localPlayerInv";
import { isEqual } from "lodash";

export function followIndexSystem(layer: PhaserLayer) {
    const {
        networkLayer: {
            clientComponents: { LocalPiece, LocalPlayer },
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

            // if no previous value, it could be buy/merge event or new sync
            // if two value the same, it means it op render removed
            if (!preV || isEqual(preV, v)) {
                if (v.slot === 0 && v.gid === 0) {
                    throw Error("sync local piece logic error");
                }
                logDebug("sync localPiece without prev value", v);

                if (v.slot !== 0) {
                    // it's a buy event
                } else if (v.idx !== 0) {
                    // it could be a merge event
                    updateComponent(LocalPlayer, playerEntity, {
                        heroesCount: player.heroesCount + 1,
                    });
                } else {
                    logDebug("uncaught case");
                }

                return;
            }

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

                // check whether is occupied on frontend
                const entities = runQuery([
                    HasValue(LocalPiece, { owner: v.owner, slot: v.slot }),
                    NotValue(LocalPiece, { gid: v.gid }),
                ]);

                // if occupied, set
                if (entities.size > 0) {
                    const altSlot = getFirstEmptyLocalInvSlot();
                    logDebug(
                        `piece ${v.gid} at slot ${v.slot} occupied, try set to slot ${altSlot}`
                    );

                    if (altSlot !== 0) {
                        updateComponent(LocalPiece, entity, {
                            slot: altSlot,
                        });
                    } else {
                        console.error("place logic error");
                    }
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

                // update local player's hero count
                updateComponent(LocalPlayer, playerEntity, {
                    heroesCount: player.heroesCount + 1,
                });
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
