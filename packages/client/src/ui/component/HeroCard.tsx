import { useCallback } from "react";
import { CreatureKey, HeroBaseAttr, useHeroesAttr } from "../hooks/useHeroAttr";
import { useInv } from "../hooks/useInv";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";
import { useDojo } from "../hooks/useDojo";
import { GameStatusEnum } from "../../dojo/types";
import { useMergeAble } from "../hooks/useMergable";
import { debug } from "console";
import { logDebug } from "../lib/utils";

const rarityBgColor: Record<number, string> = {
    1: "#4F84AF",
    2: "#8B6FBF",
    3: "#B97C34",
};

interface IHeroCard {
    creatureKey: CreatureKey;
    altarSlot: number;
}

export const HeroCard = ({ creatureKey, altarSlot }: IHeroCard) => {
    const {
        clientComponents: { Player, Altar, CreatureProfile, GameStatus },
        systemCalls: { refreshAltar, buyHero, buyAndMerge },
        account: { playerEntity, account },
    } = useDojo();

    const { firstEmptyInv } = useInv();
    const gameStatus = useComponentValue(GameStatus, zeroEntity);

    const buyHeroFn = useCallback(
        (index: number) => {
            buyHero(account, index, firstEmptyInv);
        },
        [account, buyHero, firstEmptyInv]
    );

    const mergeAble = useMergeAble(creatureKey?.id || 0);

    logDebug(`altar slot ${altarSlot} mergeAble:`, mergeAble);

    const heroAttr = useHeroesAttr(creatureKey);

    const bgColor = rarityBgColor[heroAttr?.rarity || 1];

    return (
        <div
            className={`${!heroAttr?.creature ? "invisible" : ""}`}
            onClick={() => {
                if (gameStatus?.status != GameStatusEnum.Prepare) {
                    alert("can only buy piece during prepare");
                    return;
                }
                if (mergeAble.canMerge) {
                    buyAndMerge({
                        account,
                        altarSlot,
                        gid2: mergeAble.gids[0],
                        gid3: mergeAble.gids[1],
                        onBoardIdx: mergeAble.boardIdx,
                        x: mergeAble.onBoardCoord.x,
                        y: mergeAble.onBoardCoord.y,
                        invSlot: mergeAble.invSlot,
                    });
                } else {
                    buyHeroFn(altarSlot);
                }
            }}
        >
            <div
                className="flex flex-col border-1 items-start m-2"
                style={{ backgroundColor: bgColor }}
            >
                <div className="flex justify-center items-center w-[13.75rem] h-[13.75rem]  opacity-100 bg-contain bg-no-repeat bg-center bg-[url('/assets/ui/hero_bg.png')] mx-0.5">
                    <img
                        className="h-[90%] object-contain w-[90%]"
                        src={heroAttr?.thumb}
                        alt={heroAttr?.thumb}
                    />
                </div>
                <div className="flex flex-col items-start ml-2 mt-3 text-xs text-white">
                    <div className="text-xs">{heroAttr?.name}</div>
                    <div className="flex items-center justify-center my-2">
                        <div className="-mt-1 w-4 h-4 bg-cover bg-[url('/assets/ui/gold.png')]" />
                        <div className="text-xs ml-2">
                            Cost {heroAttr?.cost}
                        </div>
                    </div>
                    <div className="ml-4"></div>
                    <div className="flex flex-row ">
                        <div className="text-[#06FF00]  ">
                            {[
                                heroAttr?.order,
                                ...(heroAttr?.origins ?? []),
                            ].join(" ")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
