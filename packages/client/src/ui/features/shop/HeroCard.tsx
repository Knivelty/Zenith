import { useCallback } from "react";
import { CreatureKey, useHeroesAttr } from "../../hooks/useHeroAttr";
import { useInv } from "../../hooks/useInv";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../../utils";
import { useDojo } from "../../hooks/useDojo";
import { GameStatusEnum } from "../../../dojo/types";
import { useMergeAble } from "../../hooks/useMergeable";
import { cn, logDebug } from "../../lib/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { ShowItem, useUIStore } from "../../../store";
import {
    SoundType,
    usePlaySoundSegment,
} from "../../hooks/usePlaySoundSegment";

const rarityBgColor: Record<number, string> = {
    1: "#7C7C7C",
    2: "#769A00",
    3: "#00569E",
};

interface IHeroCard {
    creatureKey: CreatureKey;
    altarSlot: number;
}

export const HeroCard = ({ creatureKey, altarSlot }: IHeroCard) => {
    const {
        clientComponents: { GameStatus },
        systemCalls: { buyHero, buyAndMerge },
        account: { account },
    } = useDojo();

    const { firstEmptyInv } = useInv();
    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const getShow = useUIStore((state) => state.getShow);

    const { play: playClick } = usePlaySoundSegment(SoundType.Click);
    const { play: playUpgrade } = usePlaySoundSegment(SoundType.Upgrade);

    const mergeAble = useMergeAble(creatureKey?.id || 0);

    const buyHeroFn = useCallback(() => {
        if (gameStatus?.status != GameStatusEnum.Prepare) {
            alert("can only buy piece during prepare");
            return;
        }
        playClick();

        if (mergeAble.canMerge) {
            buyAndMerge({
                account,
                altarSlot,
                gid2: mergeAble.gids[0],
                gid3: mergeAble.gids[1],
                gid4: mergeAble.gids?.[2] || 0,
                gid5: mergeAble.gids?.[3] || 0,
                x: mergeAble.onBoardCoord.x,
                y: mergeAble.onBoardCoord.y,
                invSlot: mergeAble.invSlot,
                onBoardIdx: mergeAble.boardIdx,
            }).then(() => {
                playUpgrade();
            });
        } else {
            buyHero(account, altarSlot, firstEmptyInv);
        }
    }, [
        account,
        buyHero,
        firstEmptyInv,
        altarSlot,
        buyAndMerge,
        gameStatus,
        mergeAble,
        playClick,
        playUpgrade,
    ]);

    const shouldBorderBlink = mergeAble.haveSameCid;

    logDebug(`altar slot ${altarSlot} mergeAble:`, mergeAble);

    const heroAttr = useHeroesAttr(creatureKey);

    useHotkeys(altarSlot.toString(), () => {
        if (getShow(ShowItem.Shop) && !!creatureKey.id) {
            buyHeroFn();
        }
    });

    const bgColor = rarityBgColor[heroAttr?.rarity || 1];

    return (
        <div
            className={`${!heroAttr?.creature ? "invisible" : ""}`}
            onClick={buyHeroFn}
        >
            <div
                className={cn(
                    "relative flex flex-col border-1 items-start m-2",
                    `overflow-hidden border-4 hover:border-white border-transparent box-content hover:cursor-pointer`,
                    {
                        "animate-[border-flash_1s_linear_infinite]":
                            shouldBorderBlink,
                    }
                )}
            >
                <div
                    className="absolute h-full w-full inset-0 z-10"
                    style={{ backgroundColor: bgColor }}
                ></div>
                <img
                    src={heroAttr?.thumb}
                    className="absolute h-[120%] w-[120%] z-10 opacity-25"
                ></img>
                <div className="relative flex justify-center items-center w-[13.75rem] h-[16rem]  opacity-100 bg-contain bg-no-repeat bg-center bg-black mx-2 mt-2 z-20">
                    <img
                        className="h-[80%] object-contain w-[90%] mt-2"
                        src={heroAttr?.thumb}
                        alt={heroAttr?.thumb}
                    />
                    <div className="absolute left-2 bottom-2 flex flex-col text-white text-xs space-y-2">
                        {heroAttr?.origins.map((o) => {
                            return (
                                <div className="flex flex-row items-center justify-start pixelated space-x-2">
                                    <img
                                        src={`/assets/ui/synergy/${o.toLowerCase()}_white.png`}
                                        className="w-6 h-6"
                                    ></img>
                                    <div>{o}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex w-full flex-row items-center justify-between ml-2 mt-3 text-xs text-white z-20">
                    <div className="text-xs">{heroAttr?.name}</div>
                    <div className="w-full flex items-center justify-end my-2">
                        <div className=" w-4 h-4 bg-cover bg-[url('/assets/ui/gold.png')]" />
                        <div className="text-xs ml-2">{heroAttr?.cost}</div>
                    </div>
                    <div className="ml-4"></div>
                </div>
            </div>
        </div>
    );
};
