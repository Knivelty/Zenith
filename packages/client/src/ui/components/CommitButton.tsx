import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../hooks/useDojo";
import { zeroEntity } from "../../utils";
import { ShowItem, useUIStore } from "../../store";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { SoundType, usePlaySoundSegment } from "../hooks/usePlaySoundSegment";

export function CommitButton() {
    const {
        systemCalls: { commitPreparation },
        account: { account },
        clientComponents: { GameStatus },
    } = useDojo();

    const { setShow, guideIndex, guideRun, setField } = useUIStore();

    const status = useComponentValue(GameStatus, zeroEntity);

    const { play } = usePlaySoundSegment(SoundType.Confirm);

    const commitPreparationFn = useCallback(() => {
        play();
        commitPreparation(account);
        setShow(ShowItem.Shop, false);

        if (guideRun && guideIndex === 3) {
            setField("guideIndex", guideIndex + 1);
            setField("guideRun", false);
        }
    }, [
        account,
        commitPreparation,
        setShow,
        play,
        guideIndex,
        guideRun,
        setField,
    ]);

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
            className={`guide-step-4 absolute left-1/2 transform -translate-x-1/2 top-[calc(13%+40rem)] bg-[url(/assets/ui/commit_btn.png)] pixelated bg-contain bg-no-repeat flex justify-center mt-0.5 ${visible} select-none w-60 h-10 font-dogica text-xs z-10`}
            onClick={onClick}
        >
            <div className="self-center text-black">{text}</div>
        </button>
    );
}
