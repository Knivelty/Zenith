import { HeroBaseAttr } from "../hooks/useHeroAttr";

interface HeroDetailProp {
    attr?: HeroBaseAttr;
}

export function SynergyName({ name }: { name: string }) {
    return (
        <div className="border border-[#06FF00] text-sm h-8 w-32 mr-6 flex flex-col justify-center items-center">
            <div>{name}</div>
        </div>
    );
}

export function HeroDetail(props: HeroDetailProp) {
    return (
        <div className="flex flex-col items-center justify-start w-96 h-[40rem] bg-black border border-[#06FF00] box-border">
            <div className="flex flex-row pl-8 pt-8 w-full">
                <div className="w-20 border border-[#06FF00]">
                    <img src={props.attr?.thumb}></img>
                </div>
                <div className="flex flex-col justify-end pl-4 text-sm w-[45%]">
                    <div className="pb-1"> {props.attr?.name}</div>
                    <div className="flex flex-row pt-2">
                        <img
                            className="w-4 h-4"
                            src="/assets/ui/gold.png"
                        ></img>
                        <div className="pl-2">
                            {"Cost "}
                            {(props.attr?.level ?? 0) *
                                (props.attr?.rarity ?? 0)}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row ml-auto pr-2">
                    {Array(props.attr?.level)
                        .fill(0)
                        .map((_, i) => (
                            <img
                                className="w-8 h-8"
                                src="/assets/ui/level_star.png"
                            ></img>
                        ))}
                </div>
            </div>

            <div className="flex flex-cow pl-8 pt-4 w-full">
                <SynergyName name={props.attr?.order || ""} />
                {props.attr?.origins.map((o) => {
                    return <SynergyName name={o || ""} />;
                })}
            </div>
            <div className="grid grid-cols-[10rem,1fr] gap-0 pl-8 pt-8 text-sm w-full">
                <div className=" text-[#06FF00] pb-6">
                    Health: {props.attr?.health}
                </div>
                <div className=" text-[#FF3D00] pb-6">
                    ATK: {props.attr?.attack}
                </div>
                <div className=" text-[#F2A316] pb-6">
                    Armor: {props.attr?.armor}
                </div>
                <div className="text-white pb-6">
                    Speed: {props.attr?.speed}
                </div>
                <div className="text-white pb-6">
                    Range: {props.attr?.range}
                </div>
                <div className="text-white pb-6">
                    Initiative: {props.attr?.initiative}
                </div>
            </div>
        </div>
    );
}
