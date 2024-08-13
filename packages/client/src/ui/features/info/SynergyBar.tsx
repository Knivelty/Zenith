import { useAllSynergiesCounts } from "../../hooks/useAllSynergies";
import { cn } from "../../lib/utils";

export function SynergyBar() {
    const all = useAllSynergiesCounts();

    return (
        <div className="fixed left-4 top-[5rem] h-[38rem] border border-[#06FF00] bg-black bg-contain bg-no-repeat w-60 ">
            <div className="mt-2">
                {Object.values(all).map((t) => {
                    return <SynergyActiveStatus {...t} key={t.traitName} />;
                })}
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
    // if no unlock level, do not show
    if (onBoardPieceCount === 0 && inventoryPieceCount === 0) {
        return <div></div>;
    }

    return (
        <div className="flex flex-row ml-4 my-1 h-[4.25rem]">
            <img
                className="w-16 h-16 pixelated"
                src={`/assets/ui/synergy/${traitName?.toLocaleLowerCase()}.png`}
            ></img>
            <div className="flex flex-col ml-2 text-sm ">
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
                <div className="text-sm -mt-2 -ml-6  w-auto text-[#D6A541]">
                    {onBoardPieceCount}
                </div>
            </div>
        </div>
    );
}
