import { ClientComponents } from "./createClientComponents";
import { MoveSystemProps, SystemSigner } from "./types";
import { IWorld } from "./generated/generated";
import { Account } from "starknet";
import { ContractComponents } from "./generated/contractComponents";
import { setComponent, updateComponent } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { zeroEntity } from "../utils";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    contractComponents: ContractComponents,
    { Position, GameStatus }: ClientComponents
) {
    const spawn = async (account: Account) => {
        try {
            const { transaction_hash: txHash } = await client.actions.spawn({
                account,
            });

            // const result =
            // await client.provider.provider.waitForTransaction(txHash);
        } catch (e) {
            console.error(e);
        }
    };

    const startBattle = async (account: Account) => {
        try {
            return await client.actions.startBattle({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const nextRound = async (account: Account) => {
        try {
            return await client.actions.nextRound({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const playAnimation = async () => {
        updateComponent(GameStatus, zeroEntity, {
            shouldPlay: true,
        });
    };

    return {
        spawn,
        startBattle,
        playAnimation,
        nextRound,
    };
}
