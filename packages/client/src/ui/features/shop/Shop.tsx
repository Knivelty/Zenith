import { useCallback, useState } from "react";
import { useDojo } from "../../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { HeroCard } from "./HeroCard";
import { ShowItem, UIStore, useUIStore } from "../../../store";
import { logDebug } from "../../lib/utils";
import { ClipLoader } from "react-spinners";
import { useHotkeys } from "react-hotkeys-hook";
import { SoundType, usePlaySoundSegment } from "../../hooks/usePlaySoundSegment";

const Shop = () => {
    const {
        clientComponents: { Player, Altar },
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

    const [loading, setLoading] = useState<boolean>(false);

    const { play: playRefresh } = usePlaySoundSegment(SoundType.Refresh);

    const buyRefreshHeroFn = useCallback(async () => {
        setLoading(true);
        refreshAltar(account)
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                setLoading(false);
                playRefresh();
            });
    }, [refreshAltar, account, playRefresh]);

    const playerValue = useComponentValue(Player, playerEntity);
    const heroAltar = useComponentValue(Altar, playerEntity);

    logDebug("heroAltar: ", heroAltar);

    return (
        <div
            className={`relative flex justify-center mt-16 select-none transform duration-700 z-10 ${
                shopShow ? "scale-100" : "scale-0"
            } z-20`}
        >
            {/* {contextHolder} */}
            <div className="flex flex-col justify-center items-start">
                <div className="flex items-center justify-around ml-4 mt-4">
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

                <div className="flex flex-row justify-end items-center mt-4 ml-6 w-[100%]">
                    <button
                        onClick={() => {
                            buyRefreshHeroFn();
                        }}
                        className="flex items-center justify-center refresh h-20 w-[150px] bg-contain bg-no-repeat bg-[#06FF00] mr-8"
                    >
                        <div className="flex item-center justify-center w-4/5 h-auto text-black font-bold">
                            {!loading ? (
                                <div className="flex flex-col">
                                    <div>Refresh</div>
                                    <div className="flex items-center justify-center mt-2">
                                        <div className="text-xs">
                                            {playerValue?.refreshed ? 2 : 0}
                                        </div>
                                        <div className="ml-2 -mt-1 w-4 h-4 bg-cover bg-[url('/assets/ui/gold.png')]" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <ClipLoader />
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Shop;
