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
        <div className="fixed left-4 top-[5rem] h-[35rem] border border-[#06FF00] bg-black bg-contain bg-no-repeat w-60 ">
            {Object.values(all).map((t) => {
                return <SynergyActiveStatus traits={t} />;
            })}
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
    const count = usePieceCountWithTrait(traits?.[0].trait_name);

    const unlockLevel =
        traits?.reduce((accumulator, currentValue) => {
            if (currentValue.requiredPieces <= count) {
                return accumulator + 1;
            }
            return accumulator;
        }, 0) || 0;

    return (
        <div className="flex flex-row">
            <img
                className="w-16 h-16"
                src="/assets/ui/synergy_placeholder.png"
            ></img>
            <div className="flex flex-col">
                <div>{traits?.[0].trait_name}</div>
                <div className="flex flex-row text-gray-400">
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
                <div className="text-sm">{count}</div>
            </div>
        </div>
    );
}
