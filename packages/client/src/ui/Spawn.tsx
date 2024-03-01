import { useDojo } from "./hooks/useDojo";
import { Button } from "./button";
import { useUIStore } from "../store";
import { useEffect } from "react";
import { useComponentValue } from "@dojoengine/react";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export const Spawn = () => {
    const setLoggedIn = useUIStore((state: any) => state.setLoggedIn);
    const {
        account: { account, isDeploying },
        systemCalls: { spawn },
        clientComponents: { Player },
    } = useDojo();

    useEffect(() => {
        if (isDeploying) {
            return;
        }

        if (account) {
            return;
        }
    }, [account, isDeploying]);

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
