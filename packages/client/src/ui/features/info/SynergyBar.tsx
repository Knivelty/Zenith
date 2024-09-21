import { useAllSynergiesCounts } from "../../hooks/useAllSynergies";
import { useDojo } from "../../hooks/useDojo";
import { cn } from "../../lib/utils";
import { zeroEntity } from "../../../utils";
import { useCallback } from "react";
import { updateComponent } from "@dojoengine/recs";
import { ShowItem, useUIStore } from "../../../store";

export function SynergyBar() {
    const all = useAllSynergiesCounts();

    const synergyDetailShow = useUIStore((state) =>
        state.getShow(ShowItem.SynergyDetail)
    );

    return (
        <div
            className={cn(
                "fixed left-4 top-[5rem] h-[38rem] w-60 border border-[#06FF00] bg-black bg-contain bg-no-repeat ",
                { "z-30": synergyDetailShow }
            )}
        >
            <div className="flex w-full h-full justify-start items-start">
                {/* <div className=" flex flex-col items-center justify-center space-y-1"> */}
                {/*     <div className="relative h-20 w-12 flex justify-center items-center"> */}
                {/*         <div className="bg-[#06FF00] opacity-10 w-full h-full absolute inset-0"></div> */}
                {/*         <img */}
                {/*             className="h-10 z-20" */}
                {/*             src="/assets/ui/synergy_icon.png" */}
                {/*         ></img> */}
                {/*     </div> */}
                {/*     <div className="relative h-20 w-12 flex justify-center items-center"> */}
                {/*         <div className="bg-[#06FF00] opacity-10 w-full h-full absolute inset-0"></div> */}
                {/*         <img */}
                {/*             className="h-8 z-20 pixelated" */}
                {/*             src="/assets/ui/equipment_icon.png" */}
                {/*         ></img> */}
                {/*     </div> */}
                {/* </div> */}
                <div className="mt-2 ml-4">
                    {Object.values(all).map((t) => {
                        return <SynergyActiveStatus {...t} key={t.traitName} />;
                    })}
                </div>
            </div>
        </div>
    );
}

interface ISynergyActiveStatus {
    traitName: string;
    requiredPieceCounts:
        | {
              trait_name: string;
              requiredPieces: number;
          }[]
        | undefined;
    onBoardPiecesWithTraits: {
        pieceId: number;
        traits: string[];
        creature_index: number;
    }[];
    inventoryPiecesWithTraits: {
        pieceId: number;
        traits: string[];
        creature_index: number;
    }[];
    onBoardPieceCount: number;
    inventoryPieceCount: number;
    unlockLevel: number;
}

function SynergyActiveStatus({
    traitName,
    onBoardPieceCount,
    inventoryPieceCount,
    requiredPieceCounts,
    unlockLevel,
}: ISynergyActiveStatus) {
    const {
        clientComponents: { UserOperation },
    } = useDojo();

    const setSelectedTraitFn = useCallback(() => {
        updateComponent(UserOperation, zeroEntity, {
            selectedTrait: traitName,
        });
    }, []);

    // if no unlock level, do not show
    if (onBoardPieceCount === 0 && inventoryPieceCount === 0) {
        return <div></div>;
    }

    return (
        <div
            className="flex flex-row ml-4 my-1 h-[4.25rem] hover:cursor-pointer"
            onClick={() => {
                setSelectedTraitFn();
            }}
        >
            <img
                className="w-16 h-16 pixelated"
                src={`/assets/ui/synergy/${traitName?.toLocaleLowerCase()}.png`}
            ></img>
            <div className="flex flex-col ml-4 text-sm ">
                <div className="pt-3">{traitName}</div>
                <div className="flex flex-row text-gray-400 mt-0.5">
                    {requiredPieceCounts?.map((t, index) => {
                        const unlocked = index < unlockLevel;

                        let connectStr = "";
                        if (index < requiredPieceCounts.length - 1) {
                            connectStr = "/";
                        }

                        return (
                            <div className="flex flex-row" key={index}>
                                <div
                                    className={cn({
                                        "text-[#05FF00]": unlocked,
                                    })}
                                >
                                    {t.requiredPieces}
                                </div>
                                <div>{connectStr}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="relative -mt-2 -ml-7 w-4 h-4">
                    <img
                        className="absolute w-full h-full inset-0 z-0"
                        src="/assets/ui/hexagon.png"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10 text-[0.5rem]">
                        {onBoardPieceCount}
                    </div>
                </div>
            </div>
        </div>
    );
}
