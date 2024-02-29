import {
    Type,
    World,
    defineComponent,
    overridableComponent,
} from "@dojoengine/recs";
import { ContractComponents } from "./generated/contractComponents";

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
        // Position: overridableComponent(contractComponents.Position),
        GameStatus: defineComponent(world, {
            status: Type.Number,
            shouldPlay: Type.Boolean,
            played: Type.Boolean,
            currentRound: Type.Number,
        }),
        BattleLogs: defineComponent(world, {
            inningBattleId: Type.Number,
            logs: Type.String,
        }),
        HealthBar: defineComponent(world, {
            x: Type.Number,
            y: Type.Number,
        }),
    };
}
