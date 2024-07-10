import { useCallback, useEffect, useRef } from "react";
import { PieceAttr } from "../hooks/useHeroAttr";
import { useDrag, useDrop } from "ahooks";
import { useDojo } from "../hooks/useDojo";
import { useUIStore } from "../../store";
import {
    getComponentValue,
    getComponentValueStrict,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { worldToChainCoord } from "../../phaser/systems/utils/coorConvert";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";
import { logDebug, logPlayerAction } from "../lib/utils";
import _ from "lodash";

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
            LocalPlayerInvPiece,
            LocalPlayer,
            LocalPlayerPiece,
            UserOperation,
        },
        account: {
            playerEntity,
            account: { address },
        },
    } = useDojo();
    const dragRef = useRef(null);

    const phaserRect = useUIStore((s) => s.phaserRect);
    const userOp = useComponentValue(UserOperation, zeroEntity);
    const setSelectPieceId = userOp?.selectGid;
    const setShow = useUIStore((s) => s.setShow);

    useDrag(pieceAttr, dragRef, {
        onDragStart: (e) => {
            e.dataTransfer.setData(
                "text/plain",
                pieceAttr?.gid.toString() || ""
            );
        },

        onDragEnd: (e) => {
            e.preventDefault();
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

            const player = getComponentValueStrict(LocalPlayer, playerEntity);
            const pieceEntity = getEntityIdFromKeys([BigInt(pieceAttr.gid)]);
            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            // here only check limit, do not modify
            ++player.heroesCount;
            --player.inventoryCount;

            if (player.heroesCount > player.level) {
                alert("piece exceed limit");
                console.warn("piece exceed limit");
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
                `move piece ${piece.gid} from slot ${id} to ${posX},${posY}`
            );
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

            const invPiece = getComponentValue(
                LocalPlayerInvPiece,
                getEntityIdFromKeys([BigInt(address), BigInt(id)])
            );

            // logDebug(` ${invPiece}`);

            if (invPiece && invPiece.gid !== 0) {
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
                const localPlayerInvPieceEntity = getEntityIdFromKeys([
                    BigInt(address),
                    BigInt(id),
                ]);
                const playerInvPiece = getComponentValue(
                    LocalPlayerInvPiece,
                    localPlayerInvPieceEntity
                );

                console.log("playerInvPiece: ", playerInvPiece);

                if (playerInvPiece?.gid && playerInvPiece?.gid !== 0) {
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
                    const lastPiece = getComponentValueStrict(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([
                            BigInt(address),
                            BigInt(playerV.heroesCount),
                        ])
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
            LocalPlayerInvPiece,
            LocalPlayerPiece,
            LocalPiece,
            LocalPlayer,
            UserOperation,
            address,
            playerEntity,
            id,
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
            <div className="relative flex flex-col border-1 items-start group">
                <div
                    ref={dropRef}
                    className="flex justify-center w-[5.9375rem] h-[8.125rem] rounded-lg opacity-100 bg-contain bg-no-repeat bg-center bg-black border-[#05FF00] border-2 mx-2"
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
                    <img
                        ref={dragRef}
                        className={`w-auto h-auto object-contain ${!pieceAttr?.creature ? "invisible" : ""} `}
                        src={pieceAttr?.thumb}
                        alt={pieceAttr?.thumb}
                    />
                </div>
            </div>
        </div>
    );
};
