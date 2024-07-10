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
        rpcUrl: "https://api.cartridge.gg/x/zenith/katana",
        toriiUrl: "https://api.cartridge.gg/x/zenith/torii",
        worldAddress:
            "0x645cb3e9b4d7ae1afd34d64085e61519e431c39d4811f4e6bbc5f16b66fb0",
    },
    fly: {
        rpcUrl: "https://zenith-katana.fly.dev",
        toriiUrl: "https://zenith-torii.fly.dev",
        worldAddress:
            "0x645cb3e9b4d7ae1afd34d64085e61519e431c39d4811f4e6bbc5f16b66fb0",
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
