import { useGameEnd } from "../../hooks/useControlGameEnd";
import { useDojo } from "../../hooks/useDojo";
import { GameFail } from "./GameFail";
import { GameVictory } from "./GameVictory";

export function Overview() {
    const {
        systemCalls: { confirmExit },
        account: { account },
    } = useDojo();
    const { result } = useGameEnd();

    if (result?.score == 50) {
        return <GameVictory />;
    } else {
        return <GameFail />;
    }
}
