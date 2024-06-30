import { useDojo } from "./hooks/useDojo";
import { useAllSynergies } from "./hooks/useAllSynergies";
import { usePieceCountWithTrait } from "./hooks/usePieceCountWithTrait";
import { cn } from "./lib/utils";

export function SynergyBar() {
    const {
        clientComponents: {},
    } = useDojo();

    const all = useAllSynergies();

    console.log("all:", all);

    return (
        <div className="fixed left-4 top-[5rem] h-[38rem] border border-[#06FF00] bg-black bg-contain bg-no-repeat w-60 ">
            <div className="mt-2">
                {Object.values(all).map((t) => {
                    return <SynergyActiveStatus traits={t} />;
                })}
            </div>
        </div>
    );
}

interface ISynergyActiveStatus {
    traits?: {
        trait_name: string;
        requiredPieces: number;
    }[];
}

function SynergyActiveStatus({ traits }: ISynergyActiveStatus) {
    const traitName = traits?.[0].trait_name;
    const count = usePieceCountWithTrait(traits?.[0].trait_name);

    const unlockLevel =
        traits?.reduce((accumulator, currentValue) => {
            if (currentValue.requiredPieces <= count) {
                return accumulator + 1;
            }
            return accumulator;
        }, 0) || 0;

    return (
        <div className="flex flex-row ml-4 my-1 h-[4.25rem]">
            <img
                className="w-16 h-16 pixelated"
                src={`/assets/ui/synergy/${traitName?.toLocaleLowerCase()}.png`}
            ></img>
            <div className="flex flex-col ml-2 text-sm ">
                <div className="pt-3">{traits?.[0].trait_name}</div>
                <div className="flex flex-row text-gray-400 mt-0.5">
                    {traits?.map((t, index) => {
                        const unlocked = index < unlockLevel;

                        let connectStr = "";
                        if (index < traits.length - 1) {
                            connectStr = "/";
                        }

                        return (
                            <div className="flex flex-row">
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
                    {count}
                </div>
            </div>
        </div>
    );
}
