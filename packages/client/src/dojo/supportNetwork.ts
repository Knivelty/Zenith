export const supportedNetworks: Record<
    string,
    { rpcUrl: string; toriiUrl: string; worldAddress: string }
> = {
    local: {
        rpcUrl: "http://localhost:5050",
        toriiUrl: "http://localhost:8080",
        worldAddress:
            "0x645cb3e9b4d7ae1afd34d64085e61519e431c39d4811f4e6bbc5f16b66fb0",
    },
    slot: {
        rpcUrl: "https://api.cartridge.gg/x/autochessia/katana",
        toriiUrl: "https://api.cartridge.gg/x/autochessia/torii",
        worldAddress:
            "0x57cc45d1cbf3d842745b042b512514f5ea7da85785623e161d5838ae74de210",
    },
};

export const supportedNetworksArray = Object.entries(supportedNetworks).map(
    (v) => {
        return {
            name: v[0],
            ...v[1],
        };
    }
);
