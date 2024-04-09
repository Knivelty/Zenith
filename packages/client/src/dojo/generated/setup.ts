import { getSyncEntities } from "@dojoengine/state";
import * as torii from "@dojoengine/torii-client";
import { createClientComponents } from "../createClientComponents";
import { createSystemCalls } from "../createSystemCalls";
import { defineContractComponents } from "./typescript/models.gen";
import { world } from "./world";
import { setupWorld } from "./typescript/contracts.gen";
import { DojoConfig, DojoProvider } from "@dojoengine/core";
import { RpcProvider } from "starknet";
export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup({
    ...config
}: DojoConfig & { worldAddress: string; name: string | null }) {
    // torii client
    const toriiClient = await torii.createClient([], {
        rpcUrl: config.rpcUrl,
        toriiUrl: config.toriiUrl,
        relayUrl: config.relayUrl,
        worldAddress: config.worldAddress,
    });

    const rpcProvider = new RpcProvider({
        nodeUrl: config.rpcUrl,
    });

    // create contract components
    const contractComponents = defineContractComponents(world);

    // create client components
    const clientComponents = createClientComponents({
        contractComponents,
        world,
    });

    // fetch all existing entities from torii
    // sync it asynchronously
    await getSyncEntities(toriiClient, contractComponents as any);

    const client = await setupWorld(
        new DojoProvider(config.manifest, config.rpcUrl)
    );

    return {
        client,
        clientComponents,
        contractComponents,
        systemCalls: createSystemCalls(
            { client },
            clientComponents,
            clientComponents,
            rpcProvider
        ),
        config,
    };
}
