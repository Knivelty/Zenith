import { useCallback, useEffect, useRef } from "react";
import { PieceAttr } from "../../hooks/useHeroAttr";
import { useDrag, useDrop } from "ahooks";
import { useDojo } from "../../hooks/useDojo";
import { useUIStore } from "../../../store";
import {
    getComponentValue,
    getComponentValueStrict,
    HasValue,
    runQuery,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { worldToChainCoord } from "../../../phaser/systems/utils/coorConvert";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { zeroEntity } from "../../../utils";
import { cn, logDebug, logPlayerAction } from "../../lib/utils";
import _ from "lodash";

const Level_Image_Map: Record<number, string> = {
    1: "level_one_green.png",
    2: "level_two_green.png",
    3: "level_three_green.png",
};

export const InvHero = ({
    id,
    pieceAttr,
}: {
    id: number;
    pieceAttr: PieceAttr | undefined;
    onClick?: (...args: unknown[]) => unknown | Promise<unknown>;
}) => {
    const {
        phaserLayer: {
            scenes: {
                Main: {
                    camera: { phaserCamera },
                },
            },
        },
        clientComponents: {
            LocalPiece,
            LocalPlayer,
            UserOperation,
            LocalPieceOccupation,
        },
        account: {
            playerEntity,
            account: { address },
        },
    } = useDojo();
    const dragRef = useRef(null);

    const phaserRect = useUIStore((s) => s.phaserRect);

    const { setField, guideRun, guideIndex } = useUIStore();

    const invPieceEntities = useEntityQuery([
        HasValue(LocalPiece, {
            owner: BigInt(address),
            slot: id,
        }),
    ]);

    useDrag(pieceAttr, dragRef, {
        onDragStart: (e) => {
            if (pieceAttr?.isOverride) {
                e.preventDefault();
                console.log("piece is optimistically updated, prevent");

                return;
            }

            updateComponent(UserOperation, zeroEntity, {
                dragging: true,
                draggingGid: pieceAttr?.gid,
            });
        },

        onDragEnd: (e) => {
            e.preventDefault();
            updateComponent(UserOperation, zeroEntity, {
                dragging: false,
                draggingGid: 0,
            });

            if (pieceAttr?.isOverride) {
                return;
            }
            if (!pieceAttr) {
                return;
            }
            const rawCoord = phaserCamera.getWorldPoint(
                e.clientX - phaserRect.left,
                e.clientY - phaserRect.top
            );

            // no multiplied because no zoom
            const worldX = rawCoord.x;
            const worldY = rawCoord.y;

            // note: always is home on pve
            const { posX, posY } = worldToChainCoord({
                worldX,
                worldY,
                isHome: true,
            });

            console.log(posX, posY);

            if (posX < 1 || posX > 8 || posY < 1 || posY > 4) {
                console.warn("invalid dst place");
                return;
            }

            // check whether is occupied
            const occupiedEntity = getEntityIdFromKeys([
                BigInt(posX),
                BigInt(posY),
            ]);

            const pieceOccu = getComponentValue(
                LocalPieceOccupation,
                occupiedEntity
            );

            if (pieceOccu?.occupied) {
                logDebug(`pos ${posX}, ${posY} occupied`);
                return;
            }

            const player = getComponentValueStrict(LocalPlayer, playerEntity);
            const pieceEntity = getEntityIdFromKeys([BigInt(pieceAttr.gid)]);
            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            // here only check limit, do not modify
            ++player.heroesCount;
            --player.inventoryCount;

            if (player.heroesCount > player.level) {
                alert("piece exceed limit");
                logDebug("piece on board exceed limit");
                return;
            }

            // update local piece
            updateComponent(LocalPiece, pieceEntity, {
                idx: player.heroesCount,
                slot: 0,
                x: posX,
                y: posY,
            });

            logPlayerAction(
                `move piece ${piece.gid} from slot ${id} to on board ${player.heroesCount} ${posX},${posY}`
            );

            if (guideRun && guideIndex === 2 && player.heroesCount === 1) {
                setField("guideIndex", guideIndex + 1);
            }
        },
    });

    const dropRef = useRef<HTMLDivElement>(null);
    const userO = useComponentValue(UserOperation, zeroEntity);

    useDrop(dropRef, {
        onDragEnter: (e) => {
            // console.log("onDragEnter: ", e);
        },
        onDrop(e) {
            const gid = Number(e?.dataTransfer.getData("text/plain"));
            if (!gid) {
                return;
            }

            // logDebug(` ${invPiece}`);

            if (invPieceEntities.length > 0) {
                console.warn("slot occupied");
                return;
            }

            const prePiece = getComponentValueStrict(
                LocalPiece,
                getEntityIdFromKeys([BigInt(gid)])
            );

            const preSlot = prePiece.slot;

            // update piece
            updateComponent(LocalPiece, getEntityIdFromKeys([BigInt(gid)]), {
                slot: id,
            });
            logPlayerAction(`move piece ${gid} from ${preSlot} to ${id}`);
        },
        onDragLeave(e) {
            // console.log("onDragLeave: ", e);
        },
    });

    const handleMouseUp = useCallback(
        (e: MouseEvent) => {
            if (!dropRef.current) {
                console.warn("no drop ref");
                return;
            }
            const rect = dropRef.current.getBoundingClientRect();
            const clientX = e.clientX;
            const clientY = e.clientY;

            if (
                clientX >= rect.left &&
                clientX <= rect.right &&
                clientY >= rect.top &&
                clientY <= rect.bottom
            ) {
                console.log("in my side", id);

                // handle place back

                const userOp = getComponentValueStrict(
                    UserOperation,
                    zeroEntity
                );

                // check whether this slot is occupied

                if (invPieceEntities.length > 0) {
                    console.warn("slot occupied");
                    return;
                }

                const pieceGid = userOp.draggingGid;
                const pieceEntity = getEntityIdFromKeys([BigInt(pieceGid)]);

                // get the current piece value
                const pieceV = getComponentValueStrict(LocalPiece, pieceEntity);

                const playerV = getComponentValueStrict(
                    LocalPlayer,
                    playerEntity
                );

                // update piece entity
                updateComponent(LocalPiece, pieceEntity, {
                    x: 0,
                    y: 0,
                    idx: 0,
                    slot: id,
                });

                if (pieceV.idx === playerV.heroesCount) {
                    // it means the piece is the last one of player
                } else {
                    // if not, should switch the last piece
                    const lastPieceEntity = runQuery([
                        HasValue(LocalPiece, {
                            owner: BigInt(address),
                            idx: playerV.heroesCount,
                        }),
                    ]);

                    const lastPiece = getComponentValueStrict(
                        LocalPiece,
                        Array.from(lastPieceEntity)[0]
                    );

                    // update piece
                    updateComponent(
                        LocalPiece,
                        getEntityIdFromKeys([BigInt(lastPiece.gid)]),
                        { idx: pieceV.idx }
                    );

                    logDebug(
                        `update last piece ${lastPiece} to idx ${pieceV.idx}`
                    );
                }
            }
        },
        [
            LocalPiece,
            LocalPlayer,
            UserOperation,
            address,
            playerEntity,
            id,
            invPieceEntities,
        ]
    );

    useEffect(() => {
        if (userO?.dragging) {
            document.addEventListener("mouseup", handleMouseUp);
        } else {
            document.removeEventListener("mouseup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [userO, handleMouseUp]);

    return (
        <div>
            <div className="relative flex flex-col border-1 items-center justify-center group">
                <div
                    ref={dropRef}
                    className={cn(
                        "flex flex-col justify-center items-center w-[5rem] h-[5rem] opacity-100 bg-contain bg-no-repeat bg-center bg-black border-[#05FF00] border border-opacity-20"
                    )}
                    onClick={() => {
                        // ignore invalid gid
                        if (!pieceAttr?.gid) {
                            return;
                        }
                        updateComponent(UserOperation, zeroEntity, {
                            selected: true,
                            selectGid: pieceAttr?.gid,
                        });
                    }}
                >
                    <div
                        className={cn(
                            "w-full h-full flex justify-center items-center",
                            {
                                "opacity-25": pieceAttr?.isOverride,
                                invisible: !pieceAttr?.creature,
                            }
                        )}
                    >
                        <img
                            src={`/assets/ui/${Level_Image_Map[pieceAttr?.level ?? 1]}`}
                            className={cn("absolute top-1 w-[80%]", {})}
                        ></img>
                        <img
                            ref={dragRef}
                            className={cn(
                                `mt-2 w-[70%] h-[70%] object-contain `
                            )}
                            src={pieceAttr?.thumb}
                            alt={pieceAttr?.thumb}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
