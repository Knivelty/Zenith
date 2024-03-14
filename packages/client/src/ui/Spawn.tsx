import { useDojo } from "./hooks/useDojo";
import { Button } from "./button";
import { useUIStore } from "../store";
import { useEffect } from "react";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { zeroEntity } from "../utils";

export const Spawn = () => {
    const setLoggedIn = useUIStore((state: any) => state.setLoggedIn);
    const {
        account: { account, isDeploying },
        systemCalls: { spawn },
        clientComponents: { Player, GameStatus },
    } = useDojo();

    useEffect(() => {
        if (isDeploying) {
            return;
        }

        if (account) {
            return;
        }
    }, [account, isDeploying]);

    const player = useComponentValue(
        Player,
        getEntityIdFromKeys([BigInt(account.address)])
    );

    useEffect(() => {
        if (player?.inMatch && player?.inMatch > 0) {
            setLoggedIn();
        }
    }, [player?.inMatch, setLoggedIn]);

    if (!account) {
        return <div>Deploying...</div>;
    }

    return (
        <div className="relative z-10 flex flex-wrap justify-between p-2 space-x-3">
            <Button
                variant={"default"}
                onClick={async () => {
                    await spawn(account);

                    setLoggedIn();
                }}
            >
                Start
            </Button>
        </div>
    );
};
