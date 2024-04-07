import { world as recsWorld } from "./generated/world";
import { setup } from "./generated/setup";
import { dojoConfig as dojoRawConfig } from "../../dojoConfig";
import { createBurner } from "./createBurner";
import { Account } from "starknet";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { supportedNetworks } from "./supportNetwork";

export type NetworkLayer = Awaited<ReturnType<typeof createNetworkLayer>>;

export const createNetworkLayer = async () => {
    const queryString = window.location.search;
    // override config from url param
    const urlParams = new URLSearchParams(queryString);
    const network = urlParams.get("network");
    const config = supportedNetworks[network || "slot"];

    const dojoConfig = { ...dojoRawConfig, ...config, name: network || "slot" };

    // setup world
    const setupWorld = await setup(dojoConfig);

    // const { components, systemCalls, network } = await setup();

    // create burner and init
    const { burnerManager } = await createBurner(dojoConfig);

    if (!burnerManager.account) {
        await burnerManager.create();
        location.reload();
        throw new Error("reload");
    }

    const playerEntity = getEntityIdFromKeys([
        BigInt(burnerManager.account.address),
    ]);

    return {
        ...setupWorld,
        recsWorld,
        burnerManager,
        account: burnerManager.account as Account,
        playerEntity,
    };
};
