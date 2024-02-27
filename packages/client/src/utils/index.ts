import {
    ComponentUpdate,
    QueryFragment,
    Schema,
    UpdateType,
    World,
    defineSystem,
} from "@dojoengine/recs";

/**
 * @dev add generic type to define system
 */
export function defineSystemST<S extends Schema = Schema, T = unknown>(
    world: World,
    query: QueryFragment[],
    system: (update: ComponentUpdate<S, T> & { type: UpdateType }) => void,
    options: { runOnInit?: boolean } = { runOnInit: true }
) {
    defineSystem(
        world,
        query,
        system as (update: ComponentUpdate & { type: UpdateType }) => void,
        options
    );
}
