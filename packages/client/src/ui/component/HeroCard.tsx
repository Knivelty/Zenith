import { HeroBaseAttr } from "../hooks/useHeroAttr";

const rarityBgColor: Record<number, string> = {
    1: "#4F84AF",
    2: "#8B6FBF",
    3: "#B97C34",
};

export const HeroCard = ({
    heroAttr,
    onClick,
}: {
    heroAttr: HeroBaseAttr | undefined;
    onClick?: (...args: unknown[]) => unknown | Promise<unknown>;
}) => {
    const bgColor = rarityBgColor[heroAttr?.rarity || 1];

    return (
        <div
            className={`${!heroAttr?.creature ? "invisible" : ""}`}
            onClick={onClick}
        >
            <div
                className="flex flex-col border-1 items-start m-2"
                style={{ backgroundColor: bgColor }}
            >
                <div className="flex justify-center items-center w-[220px] h-[220px]  opacity-100 bg-contain bg-no-repeat bg-center bg-[url('/assets/ui/hero_bg.png')] mx-0.5">
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
                            Cost {heroAttr?.rarity}
                        </div>
                    </div>
                    <div className="ml-4"></div>
                </div>

                {/* show class and race */}
                {/* <div className="flex flex-row -mt-8 ml-7">
                    <img
                        className="w-[20px] h-[20px] mx-1"
                        // src={getRaceImage(
                        //     hero.race as number
                        // )}
                    ></img>
                    <img
                        className="w-[20px] h-[20px] mx-1"
                        // src={getClassImage(
                        //     hero.class as number
                        // )}
                    ></img>
                </div> */}
            </div>
        </div>
    );
};
