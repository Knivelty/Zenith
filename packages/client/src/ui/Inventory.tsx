import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "./hooks/useDojo";
import { HeroBaseAttr, PieceAttr, getHeroAttr } from "./hooks/useHeroAttr";
import { getComponentValue, getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { HeroCard } from "./component/HeroCard";
import { InvHero } from "./component/InvHero";
import { useCallback } from "react";
import { useInv, useLocalInv } from "./hooks/useInv";

export function Inventory() {
    const {
        clientComponents: { Player, CreatureProfile, PlayerInvPiece, Piece },
        account: {
            playerEntity,
            account: { address },
            account,
        },
        systemCalls: { sellHero },
    } = useDojo();

    const sellHeroFn = useCallback(
        (gid: number) => {
            sellHero(account, gid);
        },
        [account, sellHero]
    );

    const { invPieces } = useLocalInv();

    // const invPieces = [...Array(6).keys()]
    //     .map((x) => x + 1)
    //     .map((i) => {
    //         const invP = getComponentValue(
    //             PlayerInvPiece,
    //             getEntityIdFromKeys([BigInt(address), BigInt(i)])
    //         );
    //         if (!invP) {
    //             return undefined;
    //         }
    //         const piece = getComponentValueStrict(
    //             Piece,
    //             getEntityIdFromKeys([BigInt(invP.gid)])
    //         );

    //         return {
    //             ...getHeroAttr(CreatureProfile, {
    //                 id: piece.creature_index,
    //                 level: piece.level,
    //             }),
    //             gid: invP.gid,
    //         } as PieceAttr;
    //     });

    // console.log("invPieces: ", invPieces);

    return (
        <div className="fixed bottom-[1%] text-center  w-screen  mx-auto flex justify-center mt-2">
            {/* <Synergy /> */}
            <div className="p-3 m-3 flex items-center rounded-xl justify-center">
                {invPieces?.map(
                    (hero: PieceAttr | undefined, index: number) => (
                        <div key={index}>
                            <InvHero
                                pieceAttr={hero}
                                onClick={() => {
                                    if (hero?.gid) {
                                        sellHeroFn(hero.gid);
                                    }
                                }}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
