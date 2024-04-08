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
        Piece: overridableComponent(contractComponents.Piece),
        PlayerInvPiece: overridableComponent(contractComponents.PlayerInvPiece),
        Altar: overridableComponent(contractComponents.Altar),
        GlobalState: overridableComponent(contractComponents.GlobalState),
        // create the corresponding local component
        LocalPiece: defineComponent(world, {
            ...contractComponents.Piece.schema,
        }),
        LocalPlayer: defineComponent(world, {
            ...contractComponents.Player.schema,
        }),
        LocalPlayerPiece: defineComponent(world, {
            ...contractComponents.PlayerPiece.schema,
        }),
        LocalPlayerInvPiece: defineComponent(world, {
            ...contractComponents.PlayerInvPiece.schema,
        }),
        // save all the piece gids, for calculate diff
        // entity equal player entity
        LocalPiecesChangeTrack: defineComponent(world, {
            gids: Type.NumberArray,
        }),
        LocalPieceOccupation: defineComponent(world, {
            x: Type.Number,
            y: Type.Number,
            occupied: Type.Boolean,
        }),
        // Position: overridableComponent(contractComponents.Position),
        GameStatus: defineComponent(world, {
            status: Type.Number,
            shouldPlay: Type.Boolean,
            played: Type.Boolean,
            currentMatch: Type.Number,
            currentRound: Type.Number,
        }),
        BattleLogs: defineComponent(world, {
            matchId: Type.Number,
            inningBattleId: Type.Number,
            winner: Type.BigInt,
            healthDecrease: Type.Number,
            logs: Type.String,
        }),
        HealthBar: defineComponent(world, {
            x: Type.Number,
            y: Type.Number,
            percentage: Type.Number,
            isPlayer: Type.Boolean,
        }),
        Health: defineComponent(world, {
            pieceEntity: Type.String,
            current: Type.Number,
            max: Type.Number,
        }),
        Attack: defineComponent(world, {
            attacker: Type.String,
            attacked: Type.String,
        }),
        UserOperation: defineComponent(world, {
            dragging: Type.Boolean,
            gid: Type.Number,
        }),
    };
}
