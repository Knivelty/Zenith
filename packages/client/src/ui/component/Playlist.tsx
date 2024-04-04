import React, { useEffect, useState } from "react";
import { useDojo } from "../hooks/useDojo";
import { generateAvatar, shortenAddress } from "../lib/utils";
import { useComponentValue } from "@dojoengine/react";

interface IPlayerStatus {
    id: string;
    name: string;
    isCurrent: boolean;
    avatar: string;
    level: number;
    health: number;
    maxHealth: number;
    coin: number;
}

function PlayerStatus({
    id,
    name,
    isCurrent,
    avatar,
    level,
    health,
    maxHealth,
    coin,
}: IPlayerStatus) {
    const healthPercentage = (health / maxHealth) * 100;

    return (
        <div
            key={id}
            className={`flex justify-center items-center  p-2 mt-[10px] ${
                isCurrent ? "border border-blue-500" : ""
            }`}
        >
            <img className="w-11 h-11" src={avatar} />
            <div className="flex flex-col w-11 h-11 justify-center">
                <span className="text-white text-center">Lv. {level}</span>
                <div className="flex items-center">
                    <img className="w-5 h-6" src="/assets/ui/gold.png"></img>
                    <span className="text-white"> {coin}</span>
                </div>
            </div>
            <div className="flex-1 grid w-11 h-11 content-around ml-2 items-center">
                <div className="text-white">{name}</div>
                <div className="w-full h-4 relative rounded-lg">
                    <div
                        className={`absolute h-4 text-center rounded-lg  flex justify-center items-center bg-[#00FF05] `}
                        style={{ width: `${healthPercentage}%` }}
                    ></div>
                    <span className="h-4 leading-none absolute left-1/2 transform -translate-x-1/2">
                        <div className="text-white">
                            {health}/{maxHealth}
                        </div>
                    </span>
                </div>
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
        <div className="fixed right-4 top-[100px] h-[820px] bg-contain bg-no-repeat ">
            <div className="ml-4 mt-6 text-white">Players Info</div>
            <div className="pl-4 pr-2 mt-2 w-72 h-20 ">
                <PlayerStatus
                    id={address}
                    name={shortenAddress(address)}
                    health={playerValue?.health || 0}
                    maxHealth={100}
                    coin={playerValue?.coin || 0}
                    avatar={generateAvatar(address)}
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

