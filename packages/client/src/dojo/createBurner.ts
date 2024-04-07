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
        feeTokenAddress: config.feeTokenAddress,
    });

    await burnerManager.init();

    return {
        burnerManager,
    };
};
