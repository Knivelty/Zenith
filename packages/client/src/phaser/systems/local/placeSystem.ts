import { PhaserLayer } from "../..";

import { defineSystemST, zeroEntity } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import { Has, getComponentValue } from "@dojoengine/recs";
import { pieceManage } from "../utils/pieceManage";
import { getPieceEntity, logDebug } from "../../../ui/lib/utils";
import { GameStatusEnum } from "../../../dojo/types";

export function placeSystem(layer: PhaserLayer) {
    const {
        scenes: {
            Main: { input },
        },
        networkLayer: {
            clientComponents: { LocalPiece, GameStatus },
            account: { address },
        },
    } = layer;

    const { spawnPiece, removePieceOnBoard } = pieceManage(layer);

    // follow local piece location
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            logDebug("incoming LocalPiece change: ", v, preV);

            function _checkPieceOwnerShipAndRemove(owner: bigint) {
                if (!v) {
                    return;
                }
                if (
                    v.idx === 0 &&
                    preV?.idx !== 0 &&
                    (v.owner === owner || preV?.owner === owner)
                ) {
                    removePieceOnBoard(v.gid);
                }
            }

            if (v) {
                // only dynamic sync player's piece
                const status = getComponentValue(GameStatus, zeroEntity);
                if (status?.status === GameStatusEnum.Invalid || !status) {
                    logDebug("no game status, skip local piece place");
                    return;
                }

                // spawn player piece
                if (v.owner === BigInt(address) && v.idx !== 0) {
                    // only allow override on prepare
                    if (status.status == GameStatusEnum.Prepare) {
                        spawnPiece(getPieceEntity(v.gid), true);
                    } else {
                        spawnPiece(getPieceEntity(v.gid), false);
                    }
                }
                logDebug("awayPlayer", status.awayPlayer);
                // spawn enemy piece
                if (v.owner === status.awayPlayer && v.idx !== 0) {
                    // only allow override on prepare
                    if (status.status == GameStatusEnum.Prepare) {
                        spawnPiece(getPieceEntity(v.gid), true);
                    } else {
                        spawnPiece(getPieceEntity(v.gid), false);
                    }
                }

                // check player's piece
                _checkPieceOwnerShipAndRemove(BigInt(address));
                // check enemy's piece
                _checkPieceOwnerShipAndRemove(status.awayPlayer);
            }
        }
    );
}
