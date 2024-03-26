import { world as recsWorld } from "./generated/world";
import { setup } from "./generated/setup";
import { dojoConfig } from "../../dojoConfig";
import { createBurner } from "./createBurner";
import { Account } from "starknet";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;

export const createNetworkLayer = async () => {
    // setup world
    const setupWorld = await setup(dojoConfig);

    // const { components, systemCalls, network } = await setup();

    // create burner and init
    const { burnerManager } = await createBurner(dojoConfig);

    const playerEntity = getEntityIdFromKeys([
        BigInt(burnerManager.account!.address),
    ]);

    return {
        ...setupWorld,
        recsWorld,
        burnerManager,
        account: burnerManager.account as Account,
        playerEntity,
    };
};
