import { Account } from "starknet";
import { store } from "../../store";
import { useBurnerManager } from "@dojoengine/create-burner";
import { Entity } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export const useDojo = () => {
    const layers = store((state) => {
        return {
            networkLayer: state.networkLayer,
            phaserLayer: state.phaserLayer,
        };
    });

    if (!layers.phaserLayer || !layers.networkLayer) {
        throw new Error("Store not initialized");
    }

    const { networkLayer, phaserLayer } = layers;

    const burner = useBurnerManager({
        burnerManager: layers.networkLayer.burnerManager,
    });

    const playerEntity: Entity = getEntityIdFromKeys([
        BigInt(networkLayer.burnerManager.account!.address),
    ]);

    return {
        networkLayer,
        phaserLayer,
        account: {
            ...burner,
            account: networkLayer.burnerManager.account as Account,
            playerEntity,
        },
        systemCalls: networkLayer.systemCalls,
        contractComponents: networkLayer.contractComponents,
        clientComponents: networkLayer.clientComponents,
    };
};
