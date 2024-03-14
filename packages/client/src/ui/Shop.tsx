import React, { useCallback, useState } from "react";
import { useDojo } from "./hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { getHeroAttr, useHeroesAttr } from "./hooks/useHeroAttr";
import { HeroCard } from "./component/HeroCard";

const SHOW_INFO_LIST = ["health", "attack", "defense", "range"] as const;

export const BG_COLOR = [
    "bg-white",
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-yellow-500",
];

const Shop = () => {
    const {
        clientComponents: { Player, Altar, CreatureProfile },
        systemCalls: { refreshAltar },
        account: { playerEntity, account },
    } = useDojo();
    // const [messageApi, contextHolder] = message.useMessage();

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

    // const [n, forceRender] = useState(0);

    const playerValue = useComponentValue(Player, playerEntity);
    const heroAltar = useComponentValue(Altar, playerEntity);

    console.log("heroAltar: ", heroAltar);
    console.log("playerEntity: ", playerEntity);

    // const buyHeroFn = (index: number, hero: HeroBaseAttr) => {
    //     if (Number(hero.cost) + 1 > (playerValue?.coin as number)) {
    //         messageApi.open({
    //             type: "error",
    //             content: "Not enough coins",
    //         });
    //         return;
    //     } else {
    //         buyHero(index);
    //     }
    // };

    return (
        <div className="flex justify-center mt-2">
            {/* {contextHolder} */}
            <div className="flex justify-center items-start w-[800px] h-40 bg-contain bg-no-repeat bg-[url('/assets/ui/shop_bg.png')]">
                <div className="flex">
                    <div className="flex items-center justify-around ml-4 mt-4">
                        <HeroCard
                            heroAttr={getHeroAttr(CreatureProfile, {
                                id: heroAltar?.slot1,
                                level: 1,
                            })}
                        />
                        <HeroCard
                            heroAttr={getHeroAttr(CreatureProfile, {
                                id: heroAltar?.slot2,
                                level: 1,
                            })}
                        />
                        <HeroCard
                            heroAttr={getHeroAttr(CreatureProfile, {
                                id: heroAltar?.slot3,
                                level: 1,
                            })}
                        />
                        <HeroCard
                            heroAttr={getHeroAttr(CreatureProfile, {
                                id: heroAltar?.slot4,
                                level: 1,
                            })}
                        />
                        <HeroCard
                            heroAttr={getHeroAttr(CreatureProfile, {
                                id: heroAltar?.slot5,
                                level: 1,
                            })}
                        />
                    </div>

                    <div className="flex justify-center items-center mt-4 ml-6">
                        <button
                            onClick={() => {
                                buyRefreshHeroFn();
                            }}
                            className="flex items-center justify-center refresh h-16 w-[102px] bg-contain bg-no-repeat bg-[url('assets/refresh.png')]"
                        >
                            <div className="flex item-center justify-center w-4/5 h-auto text-black font-bold">
                                {!loading && (
                                    <div className="flex flex-col">
                                        <div>Refresh</div>
                                        <div className="flex items-center justify-center">
                                            <div>2</div>
                                            <div className="ml-2 -mt-1 w-4 h-4 bg-cover bg-[url('assets/gold.png')]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
