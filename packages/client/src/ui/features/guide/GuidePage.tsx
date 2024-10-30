import { useEffect } from "react";
import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import { Dialog } from "../../components/Dialog";
import { GreenButton } from "../../components/GreenButton";
import { HomeBg } from "../../components/HomeBg";
import { useDojo } from "../../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../../utils";
import { GameStatusEnum } from "../../../dojo/types";

export function GuidePage() {
    const show = useUIStore((state) => state.getShow(ShowItem.GuidePage));
    const setShow = useUIStore((state) => state.setShow);
    const { setField, guideIndex, guideRun, getShow } = useUIStore();

    const { setSkipGuide } = usePersistUIStore((state) => state);

    const {
        clientComponents: { Player, GameStatus },
        account: { playerEntity },
    } = useDojo();

    const playerValue = useComponentValue(Player, playerEntity);
    const gStatus = useComponentValue(GameStatus, zeroEntity);

    useEffect(() => {
        if (
            (playerValue?.coin ?? 0) >= 4 &&
            guideIndex === 4 &&
            guideRun === false &&
            gStatus?.status == GameStatusEnum.Prepare
        ) {
            setField("guideRun", true);
        }
    }, [
        guideIndex,
        guideRun,
        playerValue?.coin,
        setField,
        gStatus?.status,
        gStatus?.dangerous,
        getShow,
    ]);

    // useEffect(() => {
    //     if () {
    //         setField("guideRun", false);
    //     }
    // }, [getShow, setField]);

    if (!show) {
        return null;
    }

    return (
        <HomeBg className="z-50">
            <Dialog className="flex ">
                <div className="text-3xl font-bold mt-24">Guide</div>
                <div className="flex flex-col space-y-12 mt-12">
                    <GreenButton
                        onClick={() => {
                            setField("guideRun", true);
                            setField("guideIndex", 0);
                            setShow(ShowItem.GuidePage, false);
                            setShow(ShowItem.InterActiveGuide, true);
                        }}
                    >
                        Yes, I am a beginner
                    </GreenButton>
                    <GreenButton
                        onClick={() => {
                            setShow(ShowItem.GuidePage, false);
                            setSkipGuide(true);
                        }}
                    >
                        I'm experienced
                    </GreenButton>
                </div>
            </Dialog>
        </HomeBg>
    );
}
