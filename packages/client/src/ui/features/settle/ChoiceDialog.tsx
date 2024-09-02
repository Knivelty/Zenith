import { ShowItem, useUIStore } from "../../../store";
import { TipsDialog } from "../../components/TipsDialog";
import { ChoiceList } from "./ChoiceList";

export function ChoiceDialog() {
    const show = useUIStore((store) => store.getShow(ShowItem.MakeChoice));

    if (!show) {
        return null;
    }

    return (
        <TipsDialog className="flex flex-col items-center">
            <ChoiceList />

            <div className="mt-12 text-[#06FF00] ">
                Choose one to affect either the Curse value or the Danger value.
            </div>
            <div className="flex text-[#06FF00] flex-row mt-2">
                <img className="w-6 h-6" src="/assets/ui/warning.png"></img>
                <div className="ml-2">
                    You must choose one before entering the next round
                </div>
            </div>
        </TipsDialog>
    );
}
