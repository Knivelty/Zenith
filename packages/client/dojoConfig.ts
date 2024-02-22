import manifest from "../contracts/target/dev/manifest.json";
import { createDojoConfig } from "@dojoengine/core";

export const dojoConfig = createDojoConfig({
    manifest,
    masterAddress: import.meta.env.VITE_PUBLIC_MASTER_ADDRESS!,
    masterPrivateKey: import.meta.env.VITE_PUBLIC_MASTER_PRIVATE_KEY!,
    accountClassHash: import.meta.env.VITE_PUBLIC_ACCOUNT_CLASS_HASH!,
});
