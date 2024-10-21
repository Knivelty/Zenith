import { ShowItem, usePersistUIStore, useUIStore } from "../../../store";
import { Dialog } from "../../components/Dialog";
import { GreenButton } from "../../components/GreenButton";
import { HomeBg } from "../../components/HomeBg";

export function GuidePage() {
    const show = useUIStore((state) => state.getShow(ShowItem.GuidePage));
    const setShow = useUIStore((state) => state.setShow);
    const { setField } = useUIStore();

    const { setSkipGuide } = usePersistUIStore((state) => state);

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
