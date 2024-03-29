import { useUIStore } from "../store";
import { Spawn } from "./Spawn";
import { ClickWrapper } from "./clickWrapper";

export const CreateAccount = () => {
    const loggedIn = useUIStore((state: any) => state.loggedIn);
    return (
        <div
            className={`absolute h-screen w-screen bg-black top-0 left-0 z-100 text-white flex justify-center ${
                loggedIn ? "hidden" : ""
            }`}
        >
            <div className="self-center border-2 p-4">
                <h3 className="text-3xl mb-2">Auto Chess Battle</h3>
                {/* <h5 className="text-xl mb-4">Auto battle</h5> */}
                <div>
                    <ClickWrapper>
                        <div className="flex space-x-3 justify-between p-2 flex-wrap">
                            <Spawn />
                        </div>
                    </ClickWrapper>
                </div>
            </div>
        </div>
    );
};
