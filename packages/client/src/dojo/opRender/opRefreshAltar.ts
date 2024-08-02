import { Account, RpcProvider } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { uuid } from "@latticexyz/utils";
import {
    waitForComponentOriginValueCome,
    waitForPromiseOrTxRevert,
} from "../../ui/lib/utils";

export const opRefreshAltar = async (
    { client }: { client: IWorld },
    { Player, Altar }: ClientComponents,
    rpcProvider: RpcProvider,
    account: Account
) => {
    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);
    const player = getComponentValueStrict(Player, playerEntity);

    const cost = player?.refreshed ? 2 : 0;

    if (player.coin <= cost) {
        alert("not enough coins");
        return;
    }

    const altarOverUuid = uuid();
    Altar.addOverride(altarOverUuid, {
        entity: playerEntity,
        value: {
            slot1: 0,
            slot2: 0,
            slot3: 0,
            slot4: 0,
            slot5: 0,
        },
    });

    try {
        const txPromise = client.home.refreshAltar({
            account,
        });
        await waitForPromiseOrTxRevert(rpcProvider, txPromise, [
            waitForComponentOriginValueCome(Player, playerEntity, {
                coin: player.coin - cost,
            }),
            waitForComponentOriginValueCome(Altar, playerEntity, {
                player: BigInt(account.address),
            }),
        ]);
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        Altar.removeOverride(altarOverUuid);
    }
};
