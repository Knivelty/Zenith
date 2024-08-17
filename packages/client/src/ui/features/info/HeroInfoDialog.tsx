import { useComponentValue } from "@dojoengine/react";
import { ShowItem, useUIStore } from "../../../store";
import { HeroDetail } from "./HeroDetail";
import { useDojo } from "../../hooks/useDojo";
import { cn } from "../../lib/utils";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { getHeroAttr, getPieceAttr } from "../../hooks/useHeroAttr";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { zeroEntity } from "../../../utils";
import { updateComponent } from "@dojoengine/recs";

export function HeroInfoDialog() {
    const {
        clientComponents: { LocalPiece, CreatureProfile, UserOperation, Piece },
    } = useDojo();
    const setShow = useUIStore((s) => s.setShow);
    const userOp = useComponentValue(UserOperation, zeroEntity);
    const pieceId = userOp?.selectGid;
    const heroInfoShow = useUIStore((s) => s.getShow(ShowItem.HeroInfoDialog));

    const piece = useComponentValue(
        LocalPiece,
        getEntityIdFromKeys([BigInt(pieceId || 0)])
    );
    const baseAttr = getHeroAttr(CreatureProfile, {
        id: piece?.creature_index,
        level: piece?.level,
    });

    const pieceAttr = getPieceAttr(Piece, pieceId);

    const dialogRef = useRef<HTMLDivElement>(null);

    useMemo(() => {
        if (userOp?.selected && userOp?.selectGid) {
            setShow(ShowItem.Shade, true);
            setShow(ShowItem.HeroInfoDialog, true);
        } else {
            setShow(ShowItem.HeroInfoDialog, false);
            setShow(ShowItem.Shade, false);
        }
    }, [setShow, userOp?.selected, userOp?.selectGid]);

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
            }
        },
        [UserOperation]
    );

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
            <HeroDetail
                gid={pieceAttr?.gid}
                owner={pieceAttr?.owner}
                attr={baseAttr}
            ></HeroDetail>
        </div>
    );
}
