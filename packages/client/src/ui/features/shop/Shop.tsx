import { useCallback, useState } from "react";
import { useDojo } from "../../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { HeroCard } from "./HeroCard";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import { cn, logDebug } from "../../lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import {
    SoundType,
    usePlaySoundSegment,
} from "../../hooks/usePlaySoundSegment";
import { Dialog } from "../../components/Dialog";
import { getEntityIdFromKeys } from "@dojoengine/utils";

const Shop = () => {
    const {
        clientComponents: { Player, Altar, LevelRarityProb },
        systemCalls: { refreshAltar },
        account: { playerEntity, account },
    } = useDojo();

    useHotkeys("r", () => {
        if (shopShow && !loading) {
            buyRefreshHeroFn();
        }
    });

    const shopShow = useUIStore((state: UIStore) =>
        state.getShow(ShowItem.Shop)
    );
    const setShow = useUIStore((state) => state.setShow);

    const [loading, setLoading] = useState<boolean>(false);

    const { play: playRefresh } = usePlaySoundSegment(SoundType.Refresh);

    const buyRefreshHeroFn = useCallback(async () => {
        if (loading) {
            return;
        }
        setLoading(true);
        refreshAltar(account)
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                setLoading(false);
                playRefresh();
            });
    }, [refreshAltar, account, playRefresh, loading]);

    const playerValue = useComponentValue(Player, playerEntity);
    const heroAltar = useComponentValue(Altar, playerEntity);

    const rarityProb = useComponentValue(
        LevelRarityProb,
        getEntityIdFromKeys([BigInt(playerValue?.level || 0n)])
    );

    logDebug("heroAltar: ", heroAltar);

    return (
        <Dialog
            className={`relative flex justify-center select-none transform duration-700 z-10 w-4/5 h-[58%] top-1/4 ${
                shopShow ? "scale-100" : "scale-0"
            } z-30`}
        >
            <div
                className={cn("absolute top-6 right-8 cursor-pointer", {})}
                onClick={() => {
                    setShow(ShowItem.Shop, false);
                }}
            >
                <img className="w-6 h-6" src="/assets/ui/close_cross.png"></img>
            </div>
            <div className="flex flex-col justify-center items-start">
                <div className="flex items-center justify-around ml-4 mt-4 space-x-2">
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot1,
                            level: 1,
                        }}
                        altarSlot={1}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot2,
                            level: 1,
                        }}
                        altarSlot={2}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot3,
                            level: 1,
                        }}
                        altarSlot={3}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot4,
                            level: 1,
                        }}
                        altarSlot={4}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot5,
                            level: 1,
                        }}
                        altarSlot={5}
                    />
                </div>

                <div className="relative flex flex-row justify-end items-center mt-4 ml-6 w-[100%]">
                    <div className="absolute flex text-sm left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-8">
                        <div className="text-white"> Probability:</div>
                        <div className="text-white">
                            Common: {rarityProb?.r1 ?? 0 * 100}%
                        </div>
                        <div className="text-[#779B02]">
                            Elite: {rarityProb?.r2 ?? 0 * 100}%
                        </div>
                        <div className="text-[#005599]">
                            Rare: {rarityProb?.r3 ?? 0 * 100}%
                        </div>
                    </div>{" "}
                    <div
                        onClick={() => {
                            buyRefreshHeroFn();
                        }}
                        className={cn(
                            "relative flex items-center justify-center refresh h-20 w-[150px] bg-contain bg-no-repeat bg-[#06FF00] mr-8",
                            { "hover:cursor-pointer": !loading }
                        )}
                    >
                        <div
                            className={cn(
                                "absolute w-full h-full flex justify-center items-center bg-black opacity-60 z-40",
                                { invisible: !loading }
                            )}
                        >
                            <img
                                src="assets/ui/loading.gif"
                                className="h-[80%]"
                            ></img>
                        </div>

                        <div className="flex item-center justify-center h-auto text-black font-bold">
                            <div className="flex flex-col">
                                <div>Refresh</div>
                                <div className="flex items-center justify-center mt-2">
                                    <div className="text-xs">
                                        {playerValue?.refreshed ? 2 : 0}
                                    </div>
                                    <div className="ml-2 -mt-1 w-4 h-4 bg-cover bg-[url('/assets/ui/gold.png')]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default Shop;
