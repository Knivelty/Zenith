import {
    Type,
    World,
    defineComponent,
    overridableComponent,
} from "@dojoengine/recs";
import { ContractComponents } from "./generated/typescript/models.gen";

export type ClientComponents = ReturnType<typeof createClientComponents>;

export function createClientComponents({
    contractComponents,
    world,
}: {
    contractComponents: ContractComponents;
    world: World;
}) {
    return {
        ...contractComponents,
        // create overridable component for optimistic rendering
        Player: overridableComponent(contractComponents.Player),
        PlayerProfile: overridableComponent(contractComponents.PlayerProfile),
        Piece: overridableComponent(contractComponents.Piece),
        PlayerInvPiece: overridableComponent(contractComponents.PlayerInvPiece),
        Altar: overridableComponent(contractComponents.Altar),
        GlobalState: overridableComponent(contractComponents.GlobalState),
        InningBattle: overridableComponent(contractComponents.InningBattle),
        // create the corresponding local component
        LocalPiece: defineComponent(
            world,
            {
                ...contractComponents.Piece.schema,
            },
            { metadata: { name: "LocalPiece" } }
        ),
        LocalPlayer: defineComponent(
            world,
            {
                ...contractComponents.Player.schema,
            },
            { metadata: { name: "LocalPlayer" } }
        ),
        // record all player owned piece
        PlayerOwnPiece: defineComponent(
            world,
            {
                gids: Type.NumberArray,
            },
            { metadata: { name: "PlayerOwnPiece" } }
        ),
        // save all the piece gids, for calculate diff
        // entity equal player entity
        LocalPiecesChangeTrack: defineComponent(
            world,
            {
                gids: Type.NumberArray,
            },
            { metadata: { name: "LocalPiecesChangeTrack" } }
        ),
        LocalPieceOccupation: defineComponent(
            world,
            {
                x: Type.Number,
                y: Type.Number,
                occupied: Type.Boolean,
            },
            { metadata: { name: "LocalPieceOccupation" } }
        ),
        LocalSynergyStatus: defineComponent(
            world,
            {
                name: Type.String,
                count: Type.Number,
                unlockLevels: Type.NumberArray,
            },
            { metadata: { name: "LocalPieceOccupation" } }
        ),
        // Position: overridableComponent(contractComponents.Position),
        GameStatus: defineComponent(
            world,
            {
                status: Type.Number,
                shouldPlay: Type.Boolean,
                played: Type.Boolean,
                currentMatch: Type.Number,
                currentRound: Type.Number,
                dangerous: Type.Boolean,
            },
            { metadata: { name: "GameStatus" } }
        ),
        BattleLogs: defineComponent(
            world,
            {
                matchId: Type.Number,
                inningBattleId: Type.Number,
                winner: Type.BigInt,
                healthDecrease: Type.Number,
                logs: Type.String,
            },
            { metadata: { name: "BattleLogs" } }
        ),
        HealthBar: defineComponent(
            world,
            {
                x: Type.Number,
                y: Type.Number,
                currentHealth: Type.Number,
                segments: Type.Number,
                filledSegments: Type.Number,
                isPlayer: Type.Boolean,
            },
            { metadata: { name: "HealthBar" } }
        ),
        HealthChange: defineComponent(
            world,
            {
                x: Type.Number,
                y: Type.Number,
                change: Type.Number,
                sign: Type.Boolean,
            },
            { metadata: { name: "HealthChange" } }
        ),
        Health: defineComponent(
            world,
            {
                pieceEntity: Type.String,
                current: Type.Number,
                max: Type.Number,
            },
            { metadata: { name: "Health" } }
        ),
        UserOperation: defineComponent(
            world,
            {
                dragging: Type.Boolean,
                draggingGid: Type.Number,
                selected: Type.Boolean,
                selectGid: Type.Number,
                skipAnimation: Type.Boolean,
                animationSpeed: Type.Number,
            },
            { metadata: { name: "UserOperation" } }
        ),
    };
}
