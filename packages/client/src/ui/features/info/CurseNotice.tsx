import { useMemo } from "react";
import { ShowItem, useUIStore } from "../../../store";
import { GreenButton } from "../../components/GreenButton";
import { Dialog } from "../../components/Dialog";
import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { GameStatusEnum } from "../../../dojo/types";

export function CurseNotice() {
    const show = useUIStore((store) => store.getShow(ShowItem.CurseNotice));
    const setShow = useUIStore((store) => store.setShow);

    const {
        clientComponents: { GameStatus },
    } = useDojo();

    const gStatus = useComponentValue(GameStatus, zeroEntity);
    const { setField, guideIndex } = useUIStore();

    useMemo(() => {
        if (
            gStatus?.currentRound === 4 &&
            gStatus.status === GameStatusEnum.Prepare
        ) {
            setShow(ShowItem.CurseNotice, true);
        }
    }, [gStatus?.currentRound, gStatus?.status, setShow]);

    if (!show) {
        return null;
    }

    return (
        <Dialog className="flex flex-col justify-center w-1/2 h-2/3">
            <img className="w-16 h-16" src="/assets/ui/curse.png"></img>
            <div className="w-4/5 text-[#FF3D00] mt-20">
                Adventurer, the forest's curse is now yours. Every creature here
                is nurturing deeper malice, and the brutal beasts are ready to
                keep you here forever. Scared? Flee now while you still have the
                chance.
            </div>
            <GreenButton
                className="w-80 h-20 mt-20"
                onClick={() => {
                    setShow(ShowItem.CurseNotice, false);
                    if (guideIndex === 6) {
                        setField("guideRun", true);
                    }
                }}
            >
                Continue Battle
            </GreenButton>
        </Dialog>
    );
}
