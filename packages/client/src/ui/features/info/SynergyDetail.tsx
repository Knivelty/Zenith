import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { zeroEntity } from "../../../utils";
import { useEffect, useRef } from "react";
import { updateComponent } from "@dojoengine/recs";
import { ShowItem, useUIStore } from "../../../store";
import {
    Trait_Base_Description,
    Trait_Buff_Description,
} from "../../constants/synergyDescription";
import { useOneSynergyDetail } from "../../hooks/useOneSynergyDetail";

export interface ISynergyDetail {
    traitName: string;
}

export function SynergyDetail() {
    const {
        clientComponents: { UserOperation },
    } = useDojo();

    const userOp = useComponentValue(UserOperation, zeroEntity);

    const traitName = userOp?.selectedTrait || "";

    const show = useUIStore((state) => state.getShow(ShowItem.SynergyDetail));

    const detailRef = useRef<HTMLDivElement>(null);

    const { synergyDetail } = useOneSynergyDetail(traitName);

    const synergyDescriptions = Trait_Buff_Description[traitName];

    // if click outside, will close the detail
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                detailRef.current &&
                !detailRef.current.contains(event.target as Node)
            ) {
                updateComponent(UserOperation, zeroEntity, {
                    selectedTrait: "",
                });
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [UserOperation]);

    if (!show) {
        return null;
    }

    return (
        <div
            ref={detailRef}
            className="absolute flex flex-col border bg-black border-[#06FF00] left-[17rem] w-[25rem] p-4 z-30"
        >
            <div className="flex flex-row items-center justify-start space-x-4 h-20">
                <img
                    className="ml-4"
                    src={`/assets/ui/synergy/${traitName.toLowerCase()}.png`}
                ></img>
                <div className="text-xl">{traitName} </div>
            </div>
            <div className="w-full h-px bg-[#06FF00] my-4"></div>
            <div>
                <div>Synergy Description</div>
                <div className="text-xs mt-2 ml-8">
                    {Trait_Base_Description[traitName]}
                </div>
                <div className="flex flex-col space-y-2 mt-4">
                    {Object.entries(synergyDescriptions).map(([k, d]) => {
                        return (
                            <div className="text-xs flex space-x-2 space-2">
                                <div className="text-white">({k})</div>
                                <div>{d}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className="w-full h-px bg-[#06FF00] my-4"></div>
            <div className="flex space-x-4">
                <div>Current </div>
                <div className="text-[#FF3D00]">
                    ({synergyDetail?.coresCount}){" "}
                </div>
            </div>

            <div></div>
        </div>
    );
}
