import { ClientComponents } from "./createClientComponents";
import { IWorld } from "./generated/typescript/contracts.gen";
import { Account, RpcProvider } from "starknet";
import { getComponentValueStrict, updateComponent } from "@dojoengine/recs";
import { utf8StringToBigInt, zeroEntity } from "../utils";
import { opBuyHero } from "./opRender/opBuyHero";
import { opSellHero } from "./opRender/opSellHero";
import { opCommitPrepare } from "./opRender/opCommitPrepare";
import {
    logCall,
    logDebug,
    waitForComponentOriginValueCome,
    waitForPromiseOrTxRevert,
} from "../ui/lib/utils";
import { opRefreshAltar } from "./opRender/opRefreshAltar";
import { opBuyAndMerge } from "./opRender/opBuyAndMerge";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { client }: { client: IWorld },
    clientComponents: ClientComponents,
    { GameStatus, Player }: ClientComponents,
    rpcProvider: RpcProvider
) {
    const spawn = async (account: Account) => {
        try {
            const { transaction_hash: txHash } = await client.home.spawn({
                account,
            });

            // const result =
            // await client.provider.provider.waitForTransaction(txHash);
        } catch (e) {
            console.error(e);
        }
    };

    const commitPreparation = async (account: Account) => {
        await opCommitPrepare(
            { client },
            clientComponents,
            rpcProvider,
            account
        );
    };

    const setName = async (account: Account, name: string) => {
        await client.home.setName({
            account,
            name: utf8StringToBigInt(name),
        });
    };

    const cheatAndSkipRound = async (account: Account) => {
        client.home.commitPreparation({
            account,
            changes: [],
            result: {
                win: false,
                healthDecrease: 0,
            },
        });
    };

    const nextRound = async (account: Account, choice: number) => {
        try {
            logDebug(`call next round, ${choice}`);
            return await client.home.nextRound({ account, choice });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const refreshAltar = async (account: Account) => {
        try {
            return await opRefreshAltar(
                { client },
                clientComponents,
                rpcProvider,
                account
            );
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const getCoin = async (account: Account) => {
        try {
            return await client.home.getCoin({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const exit = async (account: Account) => {
        try {
            return await client.home.exit({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const confirmExit = async (account: Account) => {
        try {
            return await client.home.confirmExit({ account });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const buyHero = async (
        account: Account,
        altarSlot: number,
        invSlot: number
    ) => {
        logCall(`buy hero altarSlot ${altarSlot} invSlot ${invSlot}`);
        await opBuyHero(
            { client },
            clientComponents,
            rpcProvider,
            account,
            altarSlot,
            invSlot
        );
    };

    const buyExp = async (account: Account) => {
        try {
            const playerEntity = getEntityIdFromKeys([BigInt(account.address)]);

            const playerValue = getComponentValueStrict(Player, playerEntity);
            if (playerValue.coin < 4) {
                alert("no enough coins");
                return;
            }
            await waitForPromiseOrTxRevert(
                rpcProvider,
                client.home.buyExp({
                    account,
                }),
                [
                    // any update should work
                    waitForComponentOriginValueCome(
                        clientComponents.Player,
                        playerEntity,
                        {}
                    ),
                ]
            );
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const sellHero = async (account: Account, gid: number) => {
        try {
            await opSellHero(
                { client },
                clientComponents,
                rpcProvider,
                account,
                gid
            );
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const mergeHero = async (
        props: {
            gid1: number;
            gid2: number;
            gid3: number;
            onBoardIdx: number;
            x: number;
            y: number;
            invSlot: number;
        } & { account: Account }
    ) => {
        try {
            logCall(
                `merge hero`,
                props.gid1,
                props.gid2,
                props.gid3,
                `to board ${props.onBoardIdx} ${props.x} ${props.y}`,
                `to inv ${props.invSlot}`
            );
            await client.home.mergeHero(props);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const buyAndMerge = async (
        props: {
            altarSlot: number;
            gid2: number;
            gid3: number;
            gid4: number;
            gid5: number;
            x: number;
            y: number;
            invSlot: number;
            onBoardIdx: number;
        } & { account: Account }
    ) => {
        try {
            logCall(
                `buy and merge hero`,
                props.altarSlot,
                props.gid2,
                props.gid3,
                props.gid4,
                props.gid5,
                `to board ${props.onBoardIdx} ${props.x} ${props.y}`,
                `to inv ${props.invSlot}`
            );
            await opBuyAndMerge({
                clientComponents,
                client,
                rpcProvider,
                account: props.account,
                gid2: props.gid2,
                gid3: props.gid3,
                gid4: props.gid4,
                gid5: props.gid5,
                altarSlot: props.altarSlot,
                x: props.x,
                y: props.y,
                invSlot: props.invSlot,
                onBoardIdx: props.onBoardIdx,
            });
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const playAnimation = async () => {
        updateComponent(GameStatus, zeroEntity, {
            shouldPlay: false,
        });
        updateComponent(GameStatus, zeroEntity, {
            shouldPlay: true,
        });
    };

    return {
        spawn,
        playAnimation,
        nextRound,
        refreshAltar,
        getCoin,
        buyHero,
        buyExp,
        sellHero,
        buyAndMerge,
        mergeHero,
        commitPreparation,
        cheatAndSkipRound,
        exit,
        setName,
        confirmExit,
    };
}
