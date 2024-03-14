import { HeroBaseAttr } from "../hooks/useHeroAttr";

export const HeroCard = ({
    heroAttr,
}: {
    heroAttr: HeroBaseAttr | undefined;
}) => {
    console.log("heroAttr: ", heroAttr);

    return (
        <div
            className={`${!heroAttr?.creature ? "invisible" : ""} `}
            // onClick={() => buyHeroFn(index, hero)}
        >
            <div className="flex flex-col border-1 items-start">
                <div className="flex justify-center w-[95px] h-[130px] rounded-lg opacity-100 bg-contain bg-no-repeat bg-center bg-[url('assets/ui/hero_bg.png')] mx-2">
                    <img
                        className="w-auto h-auto object-contain"
                        src={heroAttr?.thumb}
                        alt={heroAttr?.thumb}
                    />
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
