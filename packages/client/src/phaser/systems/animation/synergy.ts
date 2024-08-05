import {
    Has,
    HasValue,
    NotValue,
    getComponentValueStrict,
    runQuery,
    setComponent,
} from "@dojoengine/recs";
import {
    defineSystemST,
    getOrder,
    getOrigins,
    utf8StringToBigInt,
} from "../../../utils";
import { PhaserLayer } from "../..";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import * as R from "ramda";
import { getAllSynergies } from "../../../ui/hooks/useAllSynergies";
import { getAllBoardPiecesWithAllTraits } from "../../../ui/hooks/usePieceCountWithTrait";
import { encodeGroundEntity } from "../utils/entityEncoder";
import { getAnimation, playAnimationForOnce } from "../utils/animationHelper";
import {
    SynergyAnimations,
    TILE_HEIGHT,
    TILE_WIDTH,
} from "../../config/constants";
import { logDebug } from "../../../ui/lib/utils";

export const synergy = (layer: PhaserLayer) => {
    const {
        world,
        networkLayer: {
            clientComponents: {
                LocalPiece,
                CreatureProfile,
                SynergyProfile,
                LocalSynergyStatus,
            },
            clientComponents,
            account: { address },
        },
        scenes: {
            Main: { config, objectPool },
        },
    } = layer;

    // track synergy
    defineSystemST<typeof LocalPiece.schema>(
        world,
        [Has(LocalPiece)],
        ({ entity, type, value: [v, preV] }) => {
            if (!v) {
                return;
            }

            const onBoardPieceEntity = runQuery([
                HasValue(LocalPiece, { owner: BigInt(address) }),
                NotValue(LocalPiece, { idx: 0 }),
            ]);

            const piecesWithTraits = Array.from(onBoardPieceEntity).map(
                (entity) => {
                    const piece = getComponentValueStrict(LocalPiece, entity);

                    const pieceCreature = getComponentValueStrict(
                        CreatureProfile,
                        getEntityIdFromKeys([
                            BigInt(piece.creature_index),
                            BigInt(piece.level),
                        ])
                    );

                    const traits = [
                        getOrder(pieceCreature.order),
                        ...getOrigins(pieceCreature.origins),
                    ];

                    return {
                        pieceId: piece.gid,
                        traits,
                        creature_index: pieceCreature.creature_index,
                    };
                }
            );

            const allSynergies = getAllSynergies(SynergyProfile);

            Object.values(allSynergies)?.forEach((v) => {
                if (!v) {
                    return;
                }
                const trait_name = v[0].trait_name;
                const count = R.pipe(
                    R.filter(
                        (piece: {
                            pieceId: number;
                            traits: string[];
                            creature_index: number;
                        }) => R.includes(trait_name, piece?.traits)
                    ),
                    R.uniqBy(R.prop("creature_index"))
                )(piecesWithTraits).length;

                setComponent(
                    LocalSynergyStatus,
                    getEntityIdFromKeys([
                        BigInt(utf8StringToBigInt(trait_name)),
                    ]),
                    {
                        name: trait_name,
                        count: count,
                        unlockLevels: v.map((i) => i.requiredPieces),
                    }
                );
            });
        }
    );

    // play synergy animation
    defineSystemST<typeof LocalSynergyStatus.schema>(
        world,
        [Has(LocalSynergyStatus)],
        ({ entity, type, value: [v, preV] }) => {
            const currentUnlockLevel = v?.unlockLevels.filter(
                (i) => i <= v.count
            ).length;

            const prevUnlockLevel = preV?.unlockLevels.filter(
                (i) => i <= preV.count
            ).length;

            if (!currentUnlockLevel) {
                return;
            }

            // console.log(
            //     "currentUnlockLevel: ",
            //     currentUnlockLevel,
            //     "prevUnlockLevel: ",
            //     prevUnlockLevel,
            //     "unlockLevels: ",
            //     v.unlockLevels
            // );

            if (currentUnlockLevel - (prevUnlockLevel ?? 0) === 1) {
                // console.log("synergy", v.name, "upgrade");

                // get all relevant piece
                const allPieces = getAllBoardPiecesWithAllTraits({
                    clientComponents,
                    playerAddress: address,
                });

                const matchedPieces = allPieces.filter((p) =>
                    p.traits.includes(v.name)
                );

                logDebug("allPieces", allPieces, matchedPieces);

                matchedPieces.forEach((p) => {
                    const pieceEntity = getEntityIdFromKeys([
                        BigInt(p.pieceId),
                    ]);
                    const piece = getComponentValueStrict(
                        LocalPiece,
                        pieceEntity
                    );

                    // since it's player's piece, do following convert
                    const groundX = piece.x - 1;
                    const groundY = 8 - piece.y;

                    const groundEntity = encodeGroundEntity(groundX, groundY);

                    const groundSprite = objectPool.get(groundEntity, "Sprite");
                    groundSprite.spawn();

                    groundSprite.setComponent({
                        id: `${groundEntity}-synergy-ground`,
                        now: async (sprite: Phaser.GameObjects.Sprite) => {
                            console.log(
                                "v.name: ",
                                v.name,
                                pieceEntity,
                                piece.x
                            );

                            const ani = getAnimation(
                                v.name.toLowerCase() as SynergyAnimations
                            );

                            sprite.setPosition(
                                groundX * TILE_HEIGHT,
                                groundY * TILE_HEIGHT
                            );

                            sprite.setVisible(true);

                            await playAnimationForOnce({
                                sprite,
                                animation: ani,
                            });
                            sprite.setVisible(false);
                        },
                    });
                });
            }
        }
    );
};
