import { Account, RpcProvider } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { uuid } from "@latticexyz/utils";
import { waitForComponentOriginValueCome } from "../../ui/lib/utils";

export const opSellHero = async (
    { client }: { client: IWorld },
    { Player, Piece }: ClientComponents,
    rpcProvider: RpcProvider,
    account: Account,
    gid: number
) => {
    const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);
    const player = getComponentValueStrict(Player, playerEntity);
    const pieceEntity = getEntityIdFromKeys([BigInt(gid)]);
    const piece = getComponentValueStrict(Piece, pieceEntity);

    // check
    player.coin += 1;

    if (piece.idx) {
        player.heroesCount -= 1;
    } else {
        player.inventoryCount -= 1;
    }

    const pieceOverUuid = uuid();
    Piece.addOverride(pieceOverUuid, {
        entity: pieceEntity,
        value: {
            ...piece,
            owner: 0n,
            slot: 0,
            idx: 0,
        },
    });

    try {
        const tx = await client.home.sellHero({
            account,
            gid,
        });
        await waitForComponentOriginValueCome(Piece, pieceEntity, {
            owner: 0n,
        });
    } catch (e) {
        console.error(e);
        throw e;
    } finally {
        Piece.removeOverride(pieceOverUuid);
    }
};
