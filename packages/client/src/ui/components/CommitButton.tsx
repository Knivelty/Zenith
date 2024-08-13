import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { ShowItem, UIStore, useUIStore } from "../../store";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { usePlaySound } from "../hooks/usePlaySound";

export function CommitButton() {
    const {
        systemCalls: { commitPreparation, nextRound },
        account: {
            account,
            account: { address },
        },
        clientComponents: { GameStatus, BattleLogs },
    } = useDojo();

    const setShopShow = useUIStore((state: UIStore) => state.setShow);

    const status = useComponentValue(GameStatus, zeroEntity);

    const { play } = usePlaySound("confirm");

    const commitPreparationFn = useCallback(() => {
        play();
        commitPreparation(account);
        setShopShow(ShowItem.Shop, false);
    }, [account, commitPreparation, setShopShow, play]);

    useHotkeys("enter", () => {
        if (status?.status === 1) {
            commitPreparationFn();
        }
    });

    if (status?.status === 1) {
        return (
            <CommitOperationButton
                onClick={() => {
                    commitPreparationFn();
                }}
                text="Commit Preparation"
            />
        );
    } else {
        return <div></div>;
    }

    // if (status?.status === 3) {
    //     let winText = "";
    //     // get battle result

    //     if (battleResult?.winner === BigInt(address)) {
    //         winText = "You Win.";
    //     } else {
    //         winText = `You Lose  ${battleResult?.healthDecrease} Health. `;
    //     }
    //     return (
    //         <OperationButton
    //             onClick={() => {
    //                 nextRound(account);
    //             }}
    //             text={`${winText} Next Round`}
    //         />
    //     );
    // } else {
    //     return <OperationButton visible={"invisible"} />;
    // }
}

export function CommitOperationButton({
    onClick,
    text,
    visible,
}: {
    onClick?: () => void;
    text?: string;
    visible?: string;
}) {
    return (
        <button
            className={`absolute  left-1/2 transform -translate-x-1/2 top-[calc(10%+40rem)] bg-[url(/assets/ui/commit_btn.png)] pixelated bg-contain bg-no-repeat flex justify-center mt-0.5 ${visible} select-none w-60 h-10 font-dogica text-xs z-10`}
            onClick={onClick}
        >
            <div className="self-center text-black">{text}</div>
        </button>
    );
}
