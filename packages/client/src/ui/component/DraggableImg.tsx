import { useCallback, useEffect, useRef, useState } from "react";
import { useDojo } from "../hooks/useDojo";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";
import { getComponentValueStrict } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { getHeroAttr } from "../hooks/useHeroAttr";

export function DraggableImg() {
    const [dragImageSrc, setDragImageSrc] = useState("");
    const [shadow, setShadow] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [visible, setVisible] = useState<boolean>(false);
    const dragImageRef = useRef(null);

    const {
        clientComponents: { UserOperation, LocalPiece, CreatureProfile },
    } = useDojo();

    const userO = useComponentValue(UserOperation, zeroEntity);

    const handleMouseMove = useCallback((moveEvent: MouseEvent) => {
        setShadow({
            x: moveEvent.clientX,
            y: moveEvent.clientY,
        });
    }, []);

    useEffect(() => {
        if (userO?.dragging) {
            const piece = getComponentValueStrict(
                LocalPiece,
                getEntityIdFromKeys([BigInt(userO.draggingGid)])
            );
            const pieceAttr = getHeroAttr(CreatureProfile, {
                id: piece.creature_index,
                level: piece.level,
            });
            const imageUrl = pieceAttr?.thumb || "";
            setDragImageSrc(imageUrl);
            setVisible(true);
            document.addEventListener("mousemove", handleMouseMove);
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            setVisible(false);
        }
    }, [userO, userO?.dragging, CreatureProfile, LocalPiece, handleMouseMove]);

    return (
        <div
            className="fixed w-20 h-20"
            style={{
                left: `${shadow.x - 40}px `,
                top: `${shadow.y - 40}px `,
                visibility: `${visible ? "visible" : "hidden"}`,
            }}
        >
            <img ref={dragImageRef} src={dragImageSrc} />
        </div>
    );
}
