import { SetupNetworkResult } from "./setupNetwork";
import { ClientComponents } from "./createClientComponents";
import { MoveSystemProps, SystemSigner } from "./types";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
    { execute }: SetupNetworkResult,
    { Position }: ClientComponents
) {
    const spawn = async (props: SystemSigner) => {
        console.log(props.signer);
        try {
            await execute(props.signer, "autochessia::home::home", "spawn", []);
        } catch (e) {
            console.error(e);
        }
    };

    const startBattle = async (props: SystemSigner) => {
        const { signer } = props;

        try {
            await execute(signer, "autochessia::home::home", "startBattle", []);
        } catch (e) {
            console.log(e);
        }
    };

    return {
        spawn,
        startBattle,
    };
}
