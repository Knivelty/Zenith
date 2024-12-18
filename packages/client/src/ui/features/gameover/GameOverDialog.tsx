import { Dialog } from "../../components/Dialog";
import { useState } from "react";
import { Overview } from "./Overview";
import { Detailed } from "./Detailed";
import { ShowItem, useUIStore } from "../../../store";
import { TabButton } from "./TabButton";

export function GameOverDialog() {
    const [activeTab, setActiveTab] = useState<"overview" | "detailed">(
        "overview"
    );

    const show = useUIStore((state) => state.getShow(ShowItem.GameOverDialog));

    if (!show) {
        return null;
    }

    return (
        <Dialog>
            <div className="flex flex-row w-full">
                <TabButton
                    label="Overview"
                    isActive={activeTab === "overview"}
                    onClick={() => setActiveTab("overview")}
                />
                <TabButton
                    label="Detailed score"
                    isActive={activeTab === "detailed"}
                    onClick={() => setActiveTab("detailed")}
                />
            </div>
            <div className="mt-2">
                {activeTab === "overview" ? <Overview /> : <Detailed />}
            </div>
        </Dialog>
    );
}
