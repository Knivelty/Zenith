import React, { useState } from "react";
import { useDojo } from "../../hooks/useDojo";
import { shortenAddress } from "../../lib/utils";
import { useComponentValue } from "@dojoengine/react";
import CountUp from "react-countup";

interface IPlayerStatus {
    id: string;
    name: string;
    isCurrent: boolean;
    level: number;
    health: number;
    maxHealth: number;
    coin: number;
}

function PlayerStatus({
    id,
    name,
    isCurrent,
    level,
    health,
    maxHealth,
    coin,
}: IPlayerStatus) {
    const healthPercentage = (health / maxHealth) * 100;

    return (
        <div
            key={id}
            className={`flex flex-col justify-center items-start p-2 mt-[10px] ${
                isCurrent ? "" : ""
            }`}
        >
            <div className="flex flex-row justify-center items-center">
                <div className="flex items-center w-40">
                    <img className="" src="/assets/ui/default_icon.png"></img>
                    <div className="text-center">Lv. {level}</div>
                </div>
                <div className="flex items-center w-20">
                    <img className="w-8 h-8" src="/assets/ui/gold.png"></img>
                    <div className="ml-2">
                        <CountUp end={coin} preserveValue={true} />
                    </div>
                </div>
            </div>
            <div className="flex-1 grid w-full h-11 content-around ml-2 mt-2 items-center">
                <div className="text-sm">{name}</div>
                <div className="w-[90%] h-4 relative rounded-lg mt-3 mr-3">
                    <div
                        className={`absolute h-4 text-center rounded-lg  flex justify-center items-center bg-[#00FF05] `}
                        style={{ width: `${healthPercentage}%` }}
                    ></div>
                </div>
            </div>
            <div className="flex h-4 leading-none mt-3 ml-2 ">
                {health}/{maxHealth}
            </div>
        </div>
    );
}

export const PlayerList: React.FC = () => {
    const {
        account: {
            account: { address },
            playerEntity,
        },
        clientComponents: { Player },
    } = useDojo();

    const playerValue = useComponentValue(Player, playerEntity);

    const [showList, setShowList] = useState(true);

    // // monitor windows size to decide whether show player
    // useEffect(() => {
    //     const handleResize = () => {
    //         if (window.innerWidth / window.innerHeight < 1400 / 980) {
    //             setShowList(false);
    //         } else {
    //             setShowList(true);
    //         }
    //     };
    //     window.addEventListener("resize", handleResize);

    //     return () => {
    //         window.removeEventListener("resize", handleResize);
    //     };
    // }, []);

    if (!showList) {
        return <div></div>;
    }

    return (
        <div className="fixed right-4 top-[5rem] h-[32.5rem] border border-[#06FF00] bg-black bg-contain bg-no-repeat ">
            <div className="ml-4 mt-6">Players Info</div>
            <div className="pl-2 pr-2 mt-2 w-72 h-20 ">
                <PlayerStatus
                    id={address}
                    name={shortenAddress(address)}
                    health={playerValue?.health || 0}
                    maxHealth={100}
                    coin={playerValue?.coin || 0}
                    level={playerValue?.level || 0}
                    isCurrent={true}
                />
            </div>
        </div>
    );
};

/**
 * 
 * @param userId 
 *  id,
    name,
    isCurrent,
    avatar,
    level,
    hp,
    maxHp,
    coin,
 * @returns 
 */

const redirectToGame = (userId: string) => {
    return;
};
