import { cn } from "../../lib/utils";

export function BlankHeroCard() {
    return (
        <div className="h-[20.5rem] w-[15.5rem] bg-[url(/assets/ui/blank_hero_card.png)] bg-cover bg-no-repeat bg-center overflow-hidden">
            <div>
                <div
                    className={cn(
                        "relative flex flex-col border-1 items-start",
                        `overflow-hidden border-4 hover:border-white border-transparent box-content hover:cursor-pointer `
                    )}
                >
                    <div className="absolute h-full w-full inset-0 z-10 "></div>

                    <div className="flex w-full flex-row items-center justify-between ml-2 mt-3 text-xs text-white z-20">
                        <div className="ml-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
