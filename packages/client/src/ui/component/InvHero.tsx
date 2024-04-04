import { useRef } from "react";
import { PieceAttr } from "../hooks/useHeroAttr";
import { useDrag } from "ahooks";
import { useDojo } from "../hooks/useDojo";
import { useUIStore } from "../../store";
import { TILE_HEIGHT } from "../../phaser/config/constants";
import {
    getComponentValueStrict,
    setComponent,
    updateComponent,
} from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { worldToChainCoord } from "../../phaser/systems/utils/coorConvert";

export const InvHero = ({
    pieceAttr,
    onClick,
}: {
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
        },
        account: {
            playerEntity,
            account: { address },
        },
    } = useDojo();
    const dragRef = useRef(null);

    const dragImageRef = useRef(null);

    const phaserRect = useUIStore((s) => s.phaserRect);

    useDrag(pieceAttr, dragRef, {
        onDragStart: (e) => {
            // if (dragImageRef.current) {
            //     // 设置自定义的拖动图像
            //     e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
            // }
            // e.dataTransfer.setData(
            //     "text/plain",
            //     pieceAttr?.gid.toString() || ""
            // );
            // console.log("onDragStart: ", e);
        },

        onDragEnd: (e) => {
            e.preventDefault();
            console.log("E: ", e);
            if (!pieceAttr) {
                return;
            }
            const rawCoord = phaserCamera.getWorldPoint(
                e.clientX - phaserRect.left,
                e.clientY - phaserRect.top
            );

            console.log(e.clientX, phaserRect.left);

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
        },
    });

    return (
        <div className={`${!pieceAttr?.creature ? "invisible" : ""} `}>
            <div className="relative flex flex-col border-1 items-start group">
                <button
                    onClick={onClick}
                    className="bg-red-500 hover:bg-red-600 text-white   w-4 h-4  text-xs absolute  right-3 top-1 group-hover:block hidden   rounded"
                >
                    x
                </button>
                <div
                    draggable={true}
                    className="flex justify-center w-[95px] h-[130px] rounded-lg opacity-100 bg-contain bg-no-repeat bg-center border-gray-300	border-2 mx-2"
                >
                    <img
                        ref={dragRef}
                        className="w-auto h-auto object-contain"
                        src={pieceAttr?.thumb}
                        alt={pieceAttr?.thumb}
                    />
                </div>
                {/* show class and race */}
                {/* <div className="flex flex-row -mt-8 ml-7">
                    <img
                        className="w-[20px] h-[20px] mx-1"
                        // src={getRaceImage(
                        //     hero.race as number
                        // )}
                    ></img>
                    <img
                        className="w-[20px] h-[20px] mx-1"
                        // src={getClassImage(
                        //     hero.class as number
                        // )}
                    ></img>
                </div> */}
            </div>
        </div>
    );
};
