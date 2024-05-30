import { useDojo } from "./hooks/useDojo";
import { PieceAttr } from "./hooks/useHeroAttr";
import { InvHero } from "./component/InvHero";
import { useCallback } from "react";
import { useLocalInv } from "./hooks/useInv";
import { DraggableImg } from "./component/DraggableImg";

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

    return (
        <div className="fixed bottom-0 text-center w-screen  mx-auto flex justify-center mt-2 z-10">
            {/* <Synergy /> */}
            <div className="p-3 m-3 flex items-center rounded-xl justify-center">
                {invPieces?.map(
                    (hero: PieceAttr | undefined, index: number) => (
                        <div key={index}>
                            <InvHero
                                id={index + 1}
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
            <DraggableImg />
        </div>
    );
}
