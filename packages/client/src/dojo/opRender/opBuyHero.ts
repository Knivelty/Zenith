import { AccountInterface } from "starknet";
import { IWorld } from "../generated/generated";
import { ClientComponents } from "../createClientComponents";

export const opBuyHero = async (
    { client }: { client: IWorld },
    { Player, Altar, PlayerInvPiece }: ClientComponents,
    account: AccountInterface,
    altarSlot: number,
    invSlot: number
) => {
    try {
        return await client.actions.buyHero({
            account,
            altarSlot,
            invSlot,
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};
