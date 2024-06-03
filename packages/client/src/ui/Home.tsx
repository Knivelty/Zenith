import { Button } from "./button";
import { GreenButton } from "./component/GreenButton";
import { useDojo } from "./hooks/useDojo";
import { shortenAddress } from "./lib/utils";

export const Home = () => {
    const {
        account: { account },
        systemCalls: { spawn },
        account: {
            account: { address },
        },
    } = useDojo();

    return (
        <div className="flex z-100 absolute h-screen w-screen bg-[url('/assets/ui/home_bg.png')] top-0 left-0 text-white justify-center overflow-hidden z-20">
            <div className="text-black mt-4 ml-4 border-black border-2 h-auto self-start">
                {shortenAddress(address)}
            </div>
            <div className="w-1/2 p-4">
                <div className="flex flex-col justify-center h-full">
                    <div className="text-[#06FF00] font-dogica font-bold text-5xl self-center -mt-32">
                        Loot AutoChess
                    </div>

                    <GreenButton
                        className="self-center w-44 h-16 mt-40 text-xl font-dogica"
                        onClick={async () => {
                            await spawn(account);
                        }}
                    >
                        START
                    </GreenButton>
                </div>
            </div>
            <div className="w-1/2 p-4">
                <div className="fl ex flex-col justify-start h-full">
                    <div className="text-[#06FF00] text-3xl font-bold self-center font-dogica mt-32">
                        Rank
                    </div>
                </div>
            </div>
        </div>
        // <div
        //     className={``}
        // >
        //     <div className="self-center border-2 p-4">
        //         <h3 className="text-3xl mb-2">Auto Chess Battle</h3>
        //         {/* <h5 className="text-xl mb-4">Auto battle</h5> */}
        //         <div>
        //             <ClickWrapper>
        //                 <div className="flex space-x-3 justify-between p-2 flex-wrap">
        //                     <Spawn />
        //                 </div>
        //             </ClickWrapper>
        //         </div>
        //     </div>
        // </div>
    );
};
