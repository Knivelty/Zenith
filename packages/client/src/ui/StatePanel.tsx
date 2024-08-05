import { useEntityQuery } from "@dojoengine/react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useDojo } from "./hooks/useDojo";
import { getComponentValue, HasValue, NotValue } from "@dojoengine/recs";
import { getPlayerBoardPieceEntity } from "./lib/utils";

export function StatesPanel() {
    const {
        clientComponents: { LocalPiece, Piece, PlayerPiece, PlayerInvPiece },
        account: {
            account: { address },
        },
    } = useDojo();
    const [statesShow, setStatesShow] = useState(false);

    useHotkeys("p", () => {
        setStatesShow(!statesShow);
    });

    const localPieceOnBoard = useEntityQuery([
        HasValue(LocalPiece, { owner: BigInt(address) }),
        NotValue(LocalPiece, { idx: 0 }),
    ]);

    const pieceOnBoard = useEntityQuery([
        HasValue(Piece, { owner: BigInt(address) }),
        NotValue(Piece, { idx: 0 }),
    ]);

    const localPieceAtInv = useEntityQuery([
        HasValue(LocalPiece, { owner: BigInt(address) }),
        NotValue(LocalPiece, { slot: 0 }),
    ]);

    const pieceAtInv = useEntityQuery([
        HasValue(Piece, { owner: BigInt(address) }),
        NotValue(Piece, { slot: 0 }),
    ]);

    if (!statesShow) {
        return <div></div>;
    }

    return (
        <div className="absolute flex flex-col bg-gray-600 h-screen w-screen  transform top-1/2 -translate-y-1/2 z-50">
            <div className="text-2xl ">BoardPiece</div>
            <div className="flex flex-col">
                <div>LocalBoardPiece</div>
                <div className="flex flex-row">
                    {localPieceOnBoard.map((entity) => {
                        const piece = getComponentValue(LocalPiece, entity);

                        return (
                            <div className="flex flex-col text-sm mx-2">
                                <div>gid: {piece?.gid}</div>
                                <div>x: {piece?.x}</div>
                                <div>y: {piece?.y}</div>
                                <div>idx: {piece?.idx}</div>
                                <div>creature: {piece?.creature_index}</div>
                                <div>level: {piece?.level}</div>
                            </div>
                        );
                    })}
                </div>
                <div>RemoteBoardPiece</div>
                <div className="flex flex-row">
                    {pieceOnBoard.map((entity) => {
                        const piece = getComponentValue(Piece, entity);
                        const playerPiece = getComponentValue(
                            PlayerPiece,
                            getPlayerBoardPieceEntity(address, piece?.idx || 0)
                        );
                        return (
                            <div className="flex flex-col text-sm mx-2">
                                <div>gid: {piece?.gid}</div>
                                <div>x: {piece?.x}</div>
                                <div>y: {piece?.y}</div>
                                <div>idx: {piece?.idx}</div>
                                <div>creature: {piece?.creature_index}</div>
                                <div>level: {piece?.level}</div>
                                <div>mapGid: {playerPiece?.gid}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="text-2xl ">InvPiece</div>
            <div className="flex flex-col">
                <div>LocalInvPiece</div>
                <div className="flex flex-row">
                    {localPieceAtInv.map((entity) => {
                        const piece = getComponentValue(LocalPiece, entity);

                        return (
                            <div className="flex flex-col text-sm mx-2">
                                <div>gid: {piece?.gid}</div>
                                <div>x: {piece?.x}</div>
                                <div>y: {piece?.y}</div>
                                <div>slot: {piece?.slot}</div>
                                <div>creature: {piece?.creature_index}</div>
                                <div>level: {piece?.level}</div>
                            </div>
                        );
                    })}
                </div>
                <div>RemoteInvPiece</div>
                <div className="flex flex-row">
                    {pieceAtInv.map((entity) => {
                        const piece = getComponentValue(Piece, entity);
                        const playerPiece = getComponentValue(
                            PlayerInvPiece,
                            getPlayerBoardPieceEntity(address, piece?.slot || 0)
                        );
                        return (
                            <div className="flex flex-col text-sm mx-2">
                                <div>gid: {piece?.gid}</div>
                                <div>x: {piece?.x}</div>
                                <div>y: {piece?.y}</div>
                                <div>slot: {piece?.slot}</div>
                                <div>creature: {piece?.creature_index}</div>
                                <div>level: {piece?.level}</div>
                                <div>mapGid: {playerPiece?.gid}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
