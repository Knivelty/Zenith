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
}

// export function numToStatus(n: number): GameStatusEnum {
//     switch (n) {
//         case 1:
//             return GameStatusEnum.Prepare;
//         case 2:
//             return GameStatusEnum.InBattle;
//         default:
//             return GameStatusEnum.Invalid;
//     }
// }
