import { useDojo } from "../../hooks/useDojo";
import { PieceAttr } from "../../hooks/useHeroAttr";
import { InvHero } from "./InvHero";
import { useCallback, useRef } from "react";
import { useLocalInv } from "../../hooks/useInv";
import { DraggableImg } from "../../components/DraggableImg";
import { logDebug } from "../../lib/utils";

export function Inventory() {
    const {
        account: { account },
        systemCalls: { sellHero },
    } = useDojo();

    const ref = useRef<HTMLDivElement>(null);

    const sellHeroFn = useCallback(
        (gid: number) => {
            sellHero(account, gid);
        },
        [account, sellHero]
    );

    const { invPieces } = useLocalInv();

    logDebug("invPieces: ", invPieces);

    return (
        <div className="fixed bottom-0 text-center w-screen  mx-auto flex justify-center z-10">
            {/* <Synergy /> */}
            <div
                ref={ref}
                className="relative m-3 flex items-center rounded-xl justify-center"
            >
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
                            ></InvHero>
                            {index === 0 && (
                                <div
                                    className="absolute left-0 bottom-0  pointer-events-none z-40 h-[30rem] w-[40rem] guide-step-3"
                                    style={{
                                        width:
                                            ref.current?.getBoundingClientRect()
                                                ?.width ?? "auto",
                                    }}
                                ></div>
                            )}
                        </div>
                    )
                )}
            </div>

            <DraggableImg />
        </div>
    );
}
