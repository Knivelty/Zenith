import { useCallback, useEffect, useRef } from "react";
import { PieceAttr } from "../hooks/useHeroAttr";
import { useDrag, useDrop } from "ahooks";
import { useDojo } from "../hooks/useDojo";
import { useUIStore } from "../../store";
import {
    getComponentValue,
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { worldToChainCoord } from "../../phaser/systems/utils/coorConvert";
import { useComponentValue } from "@dojoengine/react";
import { zeroEntity } from "../../utils";
import { logPlayerAction } from "../lib/utils";

export const InvHero = ({
    id,
    pieceAttr,
    onClick,
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

    useDrag(pieceAttr, dragRef, {
        onDragStart: (e) => {
            // if (dragImageRef.current) {
            //     // 设置自定义的拖动图像
            //     e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
            // }
            e.dataTransfer.setData(
                "text/plain",
                pieceAttr?.gid.toString() || ""
            );
            // console.log("onDragStart: ", e);
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

            const { posX, posY } = worldToChainCoord(worldX, worldY);

            console.log(posX, posY);

            if (posX < 1 || posX > 8 || posY < 1 || posY > 4) {
                console.warn("invalid dst place");
                return;
            }

            const player = getComponentValueStrict(LocalPlayer, playerEntity);
            const pieceEntity = getEntityIdFromKeys([BigInt(pieceAttr.gid)]);
            const piece = getComponentValueStrict(LocalPiece, pieceEntity);

            ++player.heroesCount;
            --player.inventoryCount;

            if (player.heroesCount > player.level) {
                alert("piece exceed limit");
                console.warn("piece exceed limit");
                return;
            }

            console.log("player.heroesCount: ", player.heroesCount);

            // delete the local inv piece
            updateComponent(
                LocalPlayerInvPiece,
                getEntityIdFromKeys([player.player, BigInt(piece.slot)]),
                { gid: 0 }
            );

            // add to local player inv
            setComponent(
                LocalPlayerPiece,
                getEntityIdFromKeys([
                    player.player,
                    BigInt(player.heroesCount),
                ]),
                {
                    owner: player.player,
                    idx: player.heroesCount,
                    gid: piece.gid,
                }
            );

            // update local player's hero count and inv count
            updateComponent(LocalPlayer, playerEntity, {
                heroesCount: player.heroesCount,
                inventoryCount: player.inventoryCount,
            });

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

    const dropRef = useRef(null);
    const userO = useComponentValue(UserOperation, zeroEntity);

    useDrop(dropRef, {
        onDragEnter: (e) => {
            console.log("onDragEnter: ", e);
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

            if (!invPiece || invPiece.gid !== 0) {
                console.warn("slot occupied");
                return;
            }

            const prePiece = getComponentValueStrict(
                LocalPiece,
                getEntityIdFromKeys([BigInt(gid)])
            );

            const preSlot = prePiece.slot;

            // set new  inv piece
            setComponent(
                LocalPlayerInvPiece,
                getEntityIdFromKeys([BigInt(address), BigInt(id)]),
                { owner: BigInt(address), slot: id, gid: gid }
            );

            // update pre inv piece
            updateComponent(
                LocalPlayerInvPiece,
                getEntityIdFromKeys([BigInt(address), BigInt(preSlot)]),
                { gid: 0 }
            );

            // update  piece
            updateComponent(LocalPiece, getEntityIdFromKeys([BigInt(gid)]), {
                slot: id,
            });
            logPlayerAction(`move piece ${gid} from ${preSlot} to ${id}`);
        },
        onDragLeave(e) {
            console.log("onDragLeave: ", e);
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

                const pieceGid = userOp.gid;
                const pieceEntity = getEntityIdFromKeys([BigInt(pieceGid)]);

                // set to player local piece
                if (playerInvPiece) {
                    updateComponent(
                        LocalPlayerInvPiece,
                        localPlayerInvPieceEntity,
                        { gid: pieceGid }
                    );
                } else {
                    // if not exist before, set
                    setComponent(
                        LocalPlayerInvPiece,
                        localPlayerInvPieceEntity,
                        { owner: BigInt(address), slot: id, gid: pieceGid }
                    );
                }

                // remove from player piece
                const pieceV = getComponentValueStrict(LocalPiece, pieceEntity);

                const playerV = getComponentValueStrict(
                    LocalPlayer,
                    playerEntity
                );

                if (pieceV.idx === playerV.heroesCount) {
                    // it means the piece is the last one of player
                    updateComponent(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([
                            BigInt(address),
                            BigInt(playerV.heroesCount),
                        ]),
                        { gid: 0 }
                    );
                } else {
                    // if not, should switch the last piece
                    const lastPiece = getComponentValueStrict(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([
                            BigInt(address),
                            BigInt(playerV.heroesCount),
                        ])
                    );

                    // update player piece
                    updateComponent(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([
                            BigInt(address),
                            BigInt(pieceV.idx),
                        ]),
                        { gid: lastPiece.gid }
                    );

                    console.log("update last piece", lastPiece);

                    // update piece
                    updateComponent(
                        LocalPiece,
                        getEntityIdFromKeys([BigInt(lastPiece.gid)]),
                        { idx: pieceV.idx }
                    );

                    console.log("playerV:", playerV);

                    // set last to zero
                    updateComponent(
                        LocalPlayerPiece,
                        getEntityIdFromKeys([
                            BigInt(address),
                            BigInt(playerV.heroesCount),
                        ]),
                        { gid: 0 }
                    );
                }

                // update count for the player
                updateComponent(LocalPlayer, playerEntity, {
                    heroesCount: playerV.heroesCount - 1,
                    inventoryCount: playerV.inventoryCount + 1,
                });

                // update piece entity
                updateComponent(LocalPiece, pieceEntity, {
                    x: 0,
                    y: 0,
                    idx: 0,
                    slot: id,
                });
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
                <button
                    onClick={onClick}
                    className="bg-red-500 hover:bg-red-600 text-white   w-4 h-4  text-xs absolute  right-3 top-1 group-hover:block hidden   rounded"
                >
                    x
                </button>
                <div
                    ref={dropRef}
                    className="flex justify-center w-[95px] h-[130px] rounded-lg opacity-100 bg-contain bg-no-repeat bg-center border-gray-300	border-2 mx-2"
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
