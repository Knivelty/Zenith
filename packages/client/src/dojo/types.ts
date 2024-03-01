import { Account } from "starknet";
import { Direction } from "./utils";

export interface SystemSigner {
    signer: Account;
}

export interface MoveSystemProps extends SystemSigner {
    direction: Direction;
}

export enum GameStatusEnum {
    Invalid,
    Prepare,
    InBattle,
    WaitForNextRound,
}

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
