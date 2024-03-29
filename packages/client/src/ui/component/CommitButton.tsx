import { useComponentValue } from "@dojoengine/react";
import { Button } from "../button";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { UIStore, useUIStore } from "../../store";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export function CommitButton() {
    const {
        systemCalls: { commitPreparation, nextRound },
        account: {
            account,
            account: { address },
        },
        clientComponents: { GameStatus, BattleLogs },
    } = useDojo();

    const setShopShow = useUIStore((state: UIStore) => state.setShopShow);

    const status = useComponentValue(GameStatus, zeroEntity);

    const battleResult = useComponentValue(
        BattleLogs,
        getEntityIdFromKeys([
            BigInt(status?.currentMatch || 0),
            BigInt(status?.currentRound || 0),
        ])
    );

    if (status?.status === 1) {
        return (
            <OperationButton
                onClick={() => {
                    commitPreparation(account);
                    setShopShow(false);
                }}
                text="Commit Preparation"
            />
        );
    } else if (status?.status === 3) {
        let winText = "";
        // get battle result

        if (battleResult?.winner === BigInt(address)) {
            winText = "You Win.";
        } else {
            winText = `You Lose ${battleResult?.healthDecrease} Health. `;
        }
        return (
            <OperationButton
                onClick={() => {
                    nextRound(account);
                }}
                text={`${winText} Next Round`}
            />
        );
    } else {
        return <OperationButton visible={"invisible"} />;
    }
}

export function OperationButton({
    onClick,
    text,
    visible,
}: {
    onClick?: () => void;
    text?: string;
    visible?: string;
}) {
    return (
        <div className={`flex justify-center mt-5 ${visible}`}>
            <Button
                className="bg-white/75 text-black/50 hover:bg-slate-200/50"
                onClick={onClick}
            >
                {text}
            </Button>
        </div>
    );
}
