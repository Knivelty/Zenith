import { AccountInterface } from "starknet";
import { hash } from "starknet";
import { whitelistedHashes } from "./whitelist.generated";

export function isInWhiteList(account: AccountInterface | undefined): boolean {
    if (!account) {
        return false;
    }
    // Convert address to checksum format and hash it
    const addressHash = hash.computeHashOnElements([account.address]);
    // Check if the hash exists in the whitelist
    return whitelistedHashes.includes(addressHash.toString());
}
