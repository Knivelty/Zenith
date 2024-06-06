import { useComponentValue } from "@dojoengine/react";
import { ShowItem, UIStore, useUIStore } from "../store";
import { HeroDetail } from "./component/HeroDetail";
import { useDojo } from "./hooks/useDojo";
import { cn } from "./lib/utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { getHeroAttr } from "./hooks/useHeroAttr";
import { useCallback, useEffect, useRef } from "react";
import { zeroEntity } from "../utils";
import { updateComponent } from "@dojoengine/recs";

export function HeroInfoDialog() {
    const {
        clientComponents: { LocalPiece, CreatureProfile, UserOperation },
    } = useDojo();
    const setShow = useUIStore((s) => s.setShow);
    const userOp = useComponentValue(UserOperation, zeroEntity);
    const pieceId = userOp?.selectGid;
    const heroInfoShow = userOp?.selected;

    const piece = useComponentValue(
        LocalPiece,
        getEntityIdFromKeys([BigInt(pieceId || 0)])
    );
    const baseAttr = getHeroAttr(CreatureProfile, {
        id: piece?.creature_index,
        level: piece?.level,
    });

    const dialogRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                dialogRef.current &&
                !dialogRef.current.contains(event.target as Node)
            ) {
                updateComponent(UserOperation, zeroEntity, {
                    selected: false,
                    selectGid: 0,
                });
                setShow(ShowItem.Shade, false);
            }
        },
        [UserOperation, setShow]
    );

    // TODO: this is shade is not the same as show
    useEffect(() => {
        if (heroInfoShow) {
            setShow(ShowItem.Shade, true);
        }
    }, [heroInfoShow, setShow]);

    useEffect(() => {
        if (heroInfoShow) {
            // add small delay
            setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 1);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside, heroInfoShow]);

    return (
        <div
            className={cn("fixed top-24 right-4 z-40", {
                invisible: !heroInfoShow,
            })}
            ref={dialogRef}
        >
            <HeroDetail attr={baseAttr}></HeroDetail>
        </div>
    );
}
