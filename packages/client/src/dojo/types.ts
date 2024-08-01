import { Account } from "starknet";

export interface SystemSigner {
    signer: Account;
}

export enum GameStatusEnum {
    Invalid,
    Prepare,
    InBattle,
    WaitForNextRound,
}

export type PieceChange = {
    gid: number;
    idx: number;
    slot: number;
    x: number;
    y: number;
};

export type RoundResult = {
    win: boolean;
    healthDecrease: number;
};

export function numToStatus(n: GameStatusEnum | undefined): string {
    switch (n) {
        case GameStatusEnum.Prepare:
            return "Prepare";
        case GameStatusEnum.InBattle:
            return "InBattle";
        case GameStatusEnum.WaitForNextRound:
            return "WaitForNextRound";
        default:
            return "Invalid";
    }
}
