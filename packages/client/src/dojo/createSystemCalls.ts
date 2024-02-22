import { ClientComponents } from "./createClientComponents";
import { MoveSystemProps, SystemSigner } from "./types";
import { IWorld } from "./generated/generated";
import { Account } from "starknet";
import { ContractComponents } from "./generated/contractComponents";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    { Position }: ClientComponents
) {
    const spawn = async (account: Account) => {
        try {
            const { transaction_hash: txHash } = await client.actions.spawn({
                account,
            });

            const result =
                await client.provider.provider.waitForTransaction(txHash);

            console.log(result);
        } catch (e) {
            console.error(e);
        }
    };

    const startBattle = async (account: Account) => {
        try {
            await client.actions.startBattle({ account });
        } catch (e) {
            console.log(e);
        }
    };

    return {
        spawn,
        startBattle,
    };
}
