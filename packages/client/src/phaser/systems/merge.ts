import {
    Has,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { defineSystemST, zeroEntity } from "../../utils";
import _ from "lodash";
import {
    getPieceEntity,
    getPlayerBoardPieceEntity,
    logDebug,
} from "../../ui/lib/utils";
import { localPlayerInv } from "./utils/localPlayerInv";

export const merge = (layer: PhaserLayer) => {
    const {
        world,
        networkLayer: {
            clientComponents: {
                Piece,
                LocalPiece,
                LocalPlayerPiece,
                PlayerOwnPiece,
            },
            clientComponents,
            account: { address },
            account,
            systemCalls: { mergeHero },
        },
    } = layer;

    // this function track piece change and save
    defineSystemST<typeof Piece.schema>(
        world,
        [Has(Piece)],
        ({ entity, type, value: [v, preV] }) => {
            // add piece to array
            if (
                v?.owner === BigInt(address) &&
                preV?.owner !== BigInt(address)
            ) {
                logDebug(`add ${v.gid} to player owned piece`);

                const ownedPiece = getComponentValue(
                    PlayerOwnPiece,
                    zeroEntity
                );

                setComponent(PlayerOwnPiece, zeroEntity, {
                    gids: Array.from(new Set(ownedPiece?.gids).add(v.gid)),
                });
            }

            // remove piece
            if (
                v?.owner !== BigInt(address) &&
                preV?.owner === BigInt(address)
            ) {
                logDebug(`remove ${preV.gid} from player owned piece`);

                const ownedPiece = getComponentValue(
                    PlayerOwnPiece,
                    zeroEntity
                );

                const set = new Set(ownedPiece?.gids);
                set.delete(v?.gid || 0);

                setComponent(PlayerOwnPiece, zeroEntity, {
                    gids: Array.from(set),
                });
            }
        }
    );

    // // deal with the automatically merge logic
    // defineSystemST<typeof PlayerOwnPiece.schema>(
    //     world,
    //     [Has(PlayerOwnPiece)],
    //     ({ entity, type, value: [v, preV] }) => {
    //         const pieces = getComponentValue(PlayerOwnPiece, zeroEntity);

    //         const piecesValues = pieces?.gids.map((p: number) => {
    //             return getComponentValueStrict(Piece, getPieceEntity(p));
    //         });

    //         const fields = ["creature_index", "level"];
    //         type fieldsType = "creature_index" | "level";

    //         const grouped = _.groupBy(piecesValues, (obj) =>
    //             fields.map((attr: string) => obj[attr as fieldsType]).join("|")
    //         );

    //         const result = _.find(grouped, (group) => group.length >= 3);

    //         logDebug(`find mergable result: `, result);

    //         if (result) {
    //             // call delay
    //             setTimeout(() => {
    //                 const gid1 = result[0].gid;
    //                 const gid2 = result[1].gid;
    //                 const gid3 = result[2].gid;
    //                 const gids = [gid1, gid2, gid3];

    //                 // find the
    //                 const pieces = gids.map((id) =>
    //                     getComponentValueStrict(LocalPiece, getPieceEntity(id))
    //                 );

    //                 const onBoardIdx = pieces
    //                     .filter((v) => {
    //                         return v.idx !== 0;
    //                     })
    //                     ?.sort((a, b) => a.idx - b.idx)?.[0]?.idx;
    //                 if (onBoardIdx) {
    //                     const replacedPlayerPiece = getComponentValueStrict(
    //                         LocalPlayerPiece,
    //                         getPlayerBoardPieceEntity(address, onBoardIdx)
    //                     );
    //                     const replacedPiece = getComponentValueStrict(
    //                         LocalPiece,
    //                         getPieceEntity(replacedPlayerPiece.gid)
    //                     );
    //                     mergeHero({
    //                         account,
    //                         gid1: result[0].gid,
    //                         gid2: result[1].gid,
    //                         gid3: result[2].gid,
    //                         onBoardIdx,
    //                         x: replacedPiece.x,
    //                         y: replacedPiece.y,
    //                         invSlot: 0,
    //                     });
    //                 } else {
    //                     const invSlot =
    //                         pieces
    //                             .filter((v) => {
    //                                 return v.slot !== 0;
    //                             })
    //                             ?.sort((a, b) => a.idx - b.idx)?.[0].slot || 0;
    //                     mergeHero({
    //                         account,
    //                         gid1: result[0].gid,
    //                         gid2: result[1].gid,
    //                         gid3: result[2].gid,
    //                         onBoardIdx: 0,
    //                         x: 0,
    //                         y: 0,
    //                         invSlot,
    //                     });
    //                 }
    //             }, 1000);
    //         }
    //     }
    // );
};
