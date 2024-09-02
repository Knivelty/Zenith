import { useComponentValue } from "@dojoengine/react";
import { useDojo } from "../../hooks/useDojo";
import { useEffect, useState } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { ShowItem, useUIStore } from "../../../store";
import { zeroEntity } from "../../../utils";
import {
    Component,
    getComponentValue,
    getComponentValueStrict,
    HasValue,
    runQuery,
    updateComponent,
} from "@dojoengine/recs";
import { stringify } from "json-bigint";
import { useHotkeys } from "react-hotkeys-hook";
import { getPlayerBoardPieceEntity, logDebug } from "../../lib/utils";
import { Button } from "../../components/button";
import { processBattle } from "../../../phaser/systems/utils/processBattleLogs";

export function Debugger() {
    const {
        account: {
            account,
            account: { address },
            playerEntity,
        },
        systemCalls: {
            nextRound,
            commitPreparation,
            cheatAndSkipRound,
            getCoin,
            exit,
        },
        clientComponents: { Player, UserOperation, Piece, PlayerPiece },
        clientComponents,
        phaserLayer: { scenes },
        networkLayer: { toriiClient },
    } = useDojo();

    const [debugShow, setDebugShow] = useState(false);

    const { fetchSimulatorInput } = processBattle(clientComponents);

    useHotkeys("d", () => {
        setDebugShow(!debugShow);
    });

    useEffect(() => {
        const t = setInterval(async () => {
            try {
                await toriiClient.getEntities(1, 0);
            } catch (e) {
                alert("network disconnect, please refresh the page");
                clearInterval(t);
            }
        }, 5000);

        return () => {
            clearInterval(t);
        };
    }, [toriiClient]);

    const player = useComponentValue(
        Player,
        getEntityIdFromKeys([BigInt(account.address)])
    );

    const setLoggedIn = useUIStore((state: any) => state.setLoggedIn);
    const setShow = useUIStore((state) => state.setShow);

    useEffect(() => {
        if (player?.inMatch && player?.inMatch > 0) {
            setLoggedIn();
        }
    }, [player?.inMatch, setLoggedIn]);

    const userOp = useComponentValue(UserOperation, zeroEntity);

    const increaseFontSize = () => {
        document.documentElement.style.fontSize = `${
            Number(
                window
                    .getComputedStyle(document.documentElement)
                    .fontSize.slice(0, -2)
            ) + 2
        }px`;
    };

    const decreaseFontSize = () => {
        console.log(
            "document.documentElement.style.fontSize: ",
            window
                .getComputedStyle(document.documentElement)
                .fontSize.slice(0, -2)
        );
        document.documentElement.style.fontSize = `${
            Number(
                window
                    .getComputedStyle(document.documentElement)
                    .fontSize.slice(0, -2)
            ) - 2
        }px`;
    };

    if (!debugShow) {
        return <div></div>;
    }

    return (
        <div className="flex absolute gap-4 flex-wrap flex-col justify-between p-2 space-x-3 z-30">
            <Button
                onClick={() => {
                    increaseFontSize();
                }}
            >
                Zoom In
            </Button>
            <Button
                onClick={() => {
                    decreaseFontSize();
                }}
            >
                Zoom Out
            </Button>
            <Button
                onClick={async () => {
                    commitPreparation(account).then(() => {
                        nextRound(account, 1);
                    });
                }}
            >
                start battle
            </Button>
            <Button
                onClick={async () => {
                    nextRound(account, 1);
                }}
            >
                Skip Make Choice
            </Button>
            <Button
                onClick={async () => {
                    updateComponent(UserOperation, zeroEntity, {
                        skipAnimation: !userOp?.skipAnimation,
                    });
                }}
            >
                {userOp?.skipAnimation ? "Play" : "Skip"} Animation
            </Button>
            <Button
                onClick={async () => {
                    await cheatAndSkipRound(account);
                }}
            >
                Skip Round
            </Button>
            <Button
                onClick={async () => {
                    getCoin(account);
                }}
            >
                Get Coin
            </Button>
            <Button
                onClick={() => {
                    const allOwnedPiecesEntities = runQuery([
                        HasValue(Piece, { owner: BigInt(address) }),
                    ]);

                    const allOwnPieces = Array.from(allOwnedPiecesEntities).map(
                        (entity) => {
                            const p = getComponentValueStrict(Piece, entity);
                            return p;
                        }
                    );

                    const playerValue = getComponentValueStrict(
                        Player,
                        playerEntity
                    );

                    const playerPieceValue = Array.from(
                        {
                            length: playerValue.heroesCount,
                        },
                        (v, k) => k + 1
                    ).map((i) => {
                        return getComponentValue(
                            PlayerPiece,
                            getPlayerBoardPieceEntity(address, i)
                        );
                    });

                    logDebug("allOwnPieces: ", allOwnPieces);
                    logDebug("playerValue: ", playerValue);
                    logDebug("playerPieceValue: ", playerPieceValue);
                }}
            >
                All Own Pieces
            </Button>
            <Button
                onClick={() => {
                    const allStates = Object.values(clientComponents).reduce(
                        (acc: { [key: string]: any }, c) => {
                            const oneCompValues = Array.from(c.entities()).map(
                                (e) => {
                                    const obj = getComponentValue(
                                        c as Component,
                                        e
                                    );

                                    return obj;
                                }
                            );

                            acc[c.metadata.name] = oneCompValues;
                            return acc;
                        },
                        {}
                    );

                    // export private key also
                    allStates["privateKey"] = JSON.parse(
                        localStorage.getItem("burners_KATANA") || "{}"
                    );

                    // export simulator input
                    const simulatorInput = fetchSimulatorInput();
                    allStates["simulatorInput"] = simulatorInput;

                    const blob = new Blob([stringify(allStates)], {
                        type: "application/json;charset=utf-8",
                    });

                    const url = URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "allStates.json";

                    a.click();

                    URL.revokeObjectURL(url);
                }}
            >
                Dump States
            </Button>

            <Button
                onClick={async () => {
                    const simulatorInput = await fetchSimulatorInput();
                    const blob = new Blob([stringify(simulatorInput)], {
                        type: "application/json;charset=utf-8",
                    });

                    const url = URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "simulatorInput.json";

                    a.click();

                    URL.revokeObjectURL(url);
                }}
            >
                Dump Simulator Input
            </Button>
            <Button
                onClick={async () => {
                    const sprites =
                        scenes.Main.phaserScene.children.list.filter(
                            (child) =>
                                child instanceof Phaser.GameObjects.Sprite
                        );

                    sprites.forEach((v) => {
                        console.log(v);
                    });
                }}
            >
                Log All Sprite
            </Button>

            <Button
                onClick={async () => {
                    setShow(ShowItem.QuitConfirmation, true);
                }}
            >
                Exit Game
            </Button>
        </div>
    );
}
