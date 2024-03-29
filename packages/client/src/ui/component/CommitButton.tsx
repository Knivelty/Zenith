import { useComponentValue } from "@dojoengine/react";
import { Button } from "../button";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { UIStore, useUIStore } from "../../store";

export function CommitButton() {
    const {
        systemCalls: { commitPreparation, nextRound },
        account: { account },
        clientComponents: { GameStatus },
    } = useDojo();

    const setShopShow = useUIStore((state: UIStore) => state.setShopShow);

    const status = useComponentValue(GameStatus, zeroEntity);

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
        return (
            <OperationButton
                onClick={() => {
                    nextRound(account);
                }}
                text="Next Round"
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
        <div className={`flex justify-center mt-20 ${visible}`}>
            <Button
                className="bg-white/75 text-black hover:bg-slate-200/50"
                onClick={onClick}
            >
                {text}
            </Button>
        </div>
    );
}
