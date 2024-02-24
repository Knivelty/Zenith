import { DojoConfig } from "@dojoengine/core";
import { BurnerManager } from "@dojoengine/create-burner";
import { Account, RpcProvider } from "starknet";

export const createBurner = async ({ ...config }: DojoConfig) => {
    const rpcProvider = new RpcProvider({
        nodeUrl: config.rpcUrl,
    });

    const masterAccount = new Account(
        rpcProvider,
        config.masterAddress,
        config.masterPrivateKey
    );

    const burnerManager = new BurnerManager({
        masterAccount,
        accountClassHash: config.accountClassHash,
        rpcProvider,
    });

    // const current = burnerManager.getActiveAccount();

    if (burnerManager.list().length === 0) {
        try {
            await burnerManager.create();

            // sleep 3s
            await new Promise((resolve) => setTimeout(resolve, 3000));
        } catch (e) {
            console.error(e);
        }
    }

    await burnerManager.init();

    // await burnerManager.init();

    return {
        burnerManager,
    };
};
