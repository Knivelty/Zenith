import {
    Has,
    getComponentValue,
    getComponentValueStrict,
    setComponent,
} from "@dojoengine/recs";
import { PhaserLayer } from "..";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { defineSystemST, zeroEntity } from "../../utils";
import _ from "lodash";
import { logDebug } from "../../ui/lib/utils";
import { localPlayerInv } from "./utils/localPlayerInv";

export const merge = (layer: PhaserLayer) => {
    const {
        world,
        networkLayer: {
            clientComponents: {
                GameStatus,
                InningBattle,
                Piece,
                PlayerOwnPiece,
            },
            clientComponents,
            account: { address },
            account,
            systemCalls: { mergeHero },
        },
    } = layer;

    // note: here should use not local value, but there maybe conflict
    const { getFirstEmptyLocalInvSlot } = localPlayerInv(layer);

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

    // deal with the automatically merge logic
    defineSystemST<typeof PlayerOwnPiece.schema>(
        world,
        [Has(PlayerOwnPiece)],
        ({ entity, type, value: [v, preV] }) => {
            const pieces = getComponentValue(PlayerOwnPiece, zeroEntity);

            const piecesValues = pieces?.gids.map((p: number) => {
                return getComponentValueStrict(
                    Piece,
                    getEntityIdFromKeys([BigInt(p)])
                );
            });

            const fields = ["creature_index", "level"];
            type fieldsType = "creature_index" | "level";

            const grouped = _.groupBy(piecesValues, (obj) =>
                fields.map((attr: string) => obj[attr as fieldsType]).join("|")
            );

            const result = _.find(grouped, (group) => group.length >= 3);

            logDebug(`find mergable result: `, result);

            if (result) {
                // call delay
                setTimeout(() => {
                    const emptySlot = getFirstEmptyLocalInvSlot();
                    mergeHero(
                        account,
                        result[0].gid,
                        result[1].gid,
                        result[2].gid,
                        result[0].slot ||
                            result[1].slot ||
                            result[2].slot ||
                            emptySlot
                    );
                }, 1000);
            }
        }
    );
};
