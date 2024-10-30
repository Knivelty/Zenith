import { useComponentValue } from "@dojoengine/react";
import { ShowItem, useUIStore } from "../../../store";
import { GreenButton } from "../../components/GreenButton";
import { Dialog } from "../../components/Dialog";
import { useDojo } from "../../hooks/useDojo";
import { useEffect, useMemo, useState } from "react";
import {
    SoundType,
    usePlaySoundSegment,
} from "../../hooks/usePlaySoundSegment";
import { zeroEntity } from "../../../utils";

export function DangerStage() {
    const show = useUIStore((state) => state.getShow(ShowItem.DangerStage));
    const setShow = useUIStore((state) => state.setShow);

    const {
        clientComponents: { Player, GameStatus },
        account: { playerEntity },
    } = useDojo();

    const playerV = useComponentValue(Player, playerEntity);
    const gameStatus = useComponentValue(GameStatus, zeroEntity);
    const [roundPlayed, setRoundPlayed] = useState(new Map<number, boolean>());

    const { setField, guideIndex } = useUIStore();

    const { play: playDangerHint } = usePlaySoundSegment(SoundType.DangerHint);

    useMemo(() => {
        if (playerV?.danger && playerV?.danger > 100) {
            setTimeout(() => {
                setShow(ShowItem.DangerStage, true);
            }, 4000);
        }
    }, [playerV?.danger, setShow]);

    useEffect(() => {
        if (show && !roundPlayed.get(gameStatus?.currentRound ?? 0)) {
            playDangerHint();
            setRoundPlayed(
                roundPlayed.set(gameStatus?.currentRound ?? 0, true)
            );
        }
    }, [show, playDangerHint, gameStatus?.currentRound, roundPlayed]);

    if (!show) {
        return null;
    }

    return (
        <Dialog className="border-[#FF3D00] text-[#FF3D00] overflow-hidden">
            <img className="h-6 object-cover" src="/assets/ui/red_stripe.png" />
            <div className="w-full mt-6 flex flex-row justify-center items-center">
                <img src="/assets/ui/red_right_angle.svg" />
                <img
                    className="rotate-90 ml-[80%]"
                    src="/assets/ui/red_right_angle.svg"
                />
            </div>
            <img className="mt-8 w-16 h-16" src="/assets/ui/curse.png" />
            <div className="mt-20 w-2/3">
                Adventurer, the beasts are on the move! The forest's will has
                united, unleashing its deepest malice upon you. You're doomed,
                there's no escape now. Face the calamity head-on
            </div>
            <GreenButton
                className="bg-[#FF3D00] mt-20"
                onClick={() => {
                    setShow(ShowItem.DangerStage, false);

                    if (guideIndex === 8) {
                        setField("guideRun", true);
                    }
                }}
            >
                Continue Battle
            </GreenButton>{" "}
            <div className="w-full mt-6 flex flex-row justify-center items-center">
                <img
                    className="-rotate-90"
                    src="/assets/ui/red_right_angle.svg"
                />
                <img
                    className="rotate-180 ml-[80%]"
                    src="/assets/ui/red_right_angle.svg"
                />
            </div>
            <img
                className="absolute bottom-0 h-6 object-cover self-end"
                src="/assets/ui/red_stripe.png"
            />
        </Dialog>
    );
}
