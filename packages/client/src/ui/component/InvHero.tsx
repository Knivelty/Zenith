import { PieceAttr } from "../hooks/useHeroAttr";

export const InvHero = ({
    pieceAttr,
    onClick,
}: {
    pieceAttr: PieceAttr | undefined;
    onClick?: (...args: unknown[]) => unknown | Promise<unknown>;
}) => {
    return (
        <div className={`${!pieceAttr?.creature ? "invisible" : ""} `}>
            <div className="relative flex flex-col border-1 items-start group">
                <button
                    onClick={onClick}
                    className="bg-red-500 hover:bg-red-600 text-white   w-4 h-4  text-xs absolute  right-3 top-1 group-hover:block hidden   rounded"
                >
                    x
                </button>
                <div className="flex justify-center w-[95px] h-[130px] rounded-lg opacity-100 bg-contain bg-no-repeat bg-center border-gray-300	border-2 mx-2">
                    <img
                        className="w-auto h-auto object-contain"
                        src={pieceAttr?.thumb}
                        alt={pieceAttr?.thumb}
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
