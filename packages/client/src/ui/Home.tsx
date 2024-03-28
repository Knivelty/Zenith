import { Button } from "./button";
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
        <div className="flex z-100 absolute h-screen w-screen bg-[#D7D7D7] top-0 left-0 text-white justify-center">
            <div className="text-black mt-4 ml-4 border-black border-2 h-auto self-start	">
                {shortenAddress(address)}
            </div>
            <div className="w-5/6 p-4">
                <div className="flex flex-col justify-center h-full">
                    <div className="text-black text-6xl font-bold	self-center">
                        Loot Auto Chess
                    </div>
                    <Button
                        className="self-center w-40 mt-60 bg-white text-black rounded hover:bg-gray-300 transition duration-300"
                        onClick={async () => {
                            await spawn(account);
                        }}
                    >
                        Start
                    </Button>
                </div>
            </div>
            <div className="w-2/5 p-4">
                <div className="text-black text-3xl font-bold mt-20">Rank</div>
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
