import { PhaserLayer } from "../..";

import { defineSystemST, zeroEntity } from "../../../utils";
import { world } from "../../../dojo/generated/world";
import { Has, getComponentValue } from "@dojoengine/recs";
import { pieceManage } from "../utils/pieceManage";
import { logDebug } from "../../../ui/lib/utils";
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
            if (v) {
                // only dynamic sync player's piece
                const status = getComponentValue(GameStatus, zeroEntity);
                if (!status) {
                    logDebug("no game status, skip local piece place");
                    return;
                }

                if (v.owner === BigInt(address) && v.idx !== 0) {
                    // only allow override on prepare
                    if (status.status == GameStatusEnum.Prepare) {
                        spawnPiece(v.owner, BigInt(v.idx), true, v.gid);
                    } else {
                        spawnPiece(v.owner, BigInt(v.idx), false, v.gid);
                    }
                }
                if (v.owner === 0n && BigInt(preV?.idx || 0) !== 0n) {
                    removePieceOnBoard(v.gid);
                }
                if (v.idx === 0 && preV?.idx !== 0) {
                    removePieceOnBoard(v.gid);
                }
            }
        }
    );

    input.drag$.subscribe({
        next(value) {
            // console.log("value: ", value);
            // get start point piece
        },
    });
}
