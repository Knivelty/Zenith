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
        InningBattlePlay: defineComponent(world, {
            shouldPlay: Type.Boolean,
            played: Type.Boolean,
        }),
        BattleLogs: defineComponent(world, {
            inningBattleId: Type.Number,
            logs: Type.String,
        }),
    };
}
