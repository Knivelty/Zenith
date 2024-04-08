import { Account, AccountInterface } from "starknet";
import { IWorld } from "../generated/typescript/contracts.gen";
import { ClientComponents } from "../createClientComponents";

export const opBuyHero = async (
    { client }: { client: IWorld },
    { Player, Altar, PlayerInvPiece }: ClientComponents,
    account: Account,
    altarSlot: number,
    invSlot: number
) => {
    try {
        return await client.home.buyHero({
            account,
            altarSlot,
            invSlot,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};
