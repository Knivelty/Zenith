import { useCallback, useState } from "react";
import { useDojo } from "./hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { HeroCard } from "./component/HeroCard";
import { useInv } from "./hooks/useInv";
import { ShowItem, UIStore, useUIStore } from "../store";
import { logDebug } from "./lib/utils";
import { zeroEntity } from "../utils";
import { GameStatusEnum } from "../dojo/types";

const Shop = () => {
    const {
        clientComponents: { Player, Altar, CreatureProfile, GameStatus },
        systemCalls: { refreshAltar, buyHero },
        account: { playerEntity, account },
    } = useDojo();

    const gameStatus = useComponentValue(GameStatus, zeroEntity);

    const shopShow = useUIStore((state: UIStore) =>
        state.getShow(ShowItem.Shop)
    );

    const [loading, setLoading] = useState<boolean>(false);

    const buyRefreshHeroFn = useCallback(async () => {
        setLoading(true);
        refreshAltar(account)
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [refreshAltar, account]);

    const playerValue = useComponentValue(Player, playerEntity);
    const heroAltar = useComponentValue(Altar, playerEntity);

    logDebug("heroAltar: ", heroAltar);

    const { firstEmptyInv } = useInv();

    const buyHeroFn = useCallback(
        (index: number) => {
            if (gameStatus?.status != GameStatusEnum.Prepare) {
                alert("can only buy piece during prepare");
                return;
            }
            buyHero(account, index, firstEmptyInv);
        },
        [account, buyHero, firstEmptyInv, gameStatus?.status]
    );

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
                        onClick={() => {
                            buyHeroFn(1);
                        }}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot2,
                            level: 1,
                        }}
                        onClick={() => {
                            buyHeroFn(2);
                        }}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot3,
                            level: 1,
                        }}
                        onClick={() => {
                            buyHeroFn(3);
                        }}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot4,
                            level: 1,
                        }}
                        onClick={() => {
                            buyHeroFn(4);
                        }}
                    />
                    <HeroCard
                        creatureKey={{
                            id: heroAltar?.slot5,
                            level: 1,
                        }}
                        onClick={() => {
                            buyHeroFn(5);
                        }}
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
                            {!loading && (
                                <div className="flex flex-col">
                                    <div>Refresh</div>
                                    <div className="flex items-center justify-center mt-2">
                                        <div className="text-xs">
                                            {playerValue?.refreshed ? 2 : 0}
                                        </div>
                                        <div className="ml-2 -mt-1 w-4 h-4 bg-cover bg-[url('/assets/ui/gold.png')]" />
                                    </div>
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
