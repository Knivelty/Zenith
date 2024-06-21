import {
    ComponentUpdate,
    Entity,
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

export const zeroEntity: Entity =
    "0x0000000000000000000000000000000000000000000000000000000000000000" as Entity;

export function hexStringToUtf8(hexStringBigInt: bigint) {
    const hex = hexStringBigInt.toString(16);

    const match = hex.match(/.{1,2}/g);

    if (!match) {
        throw new Error("Invalid hexadecimal string");
    }

    const bytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));

    const decoder = new TextDecoder("utf-8");

    return decoder.decode(bytes);
}

export function getOrder(hexStringBigInt: bigint): string {
    return hexStringToUtf8(hexStringBigInt);
}

export function getOrigins(hexStringBigInt: bigint): string[] {
    return hexStringToUtf8(hexStringBigInt).split("+");
}

export function getAbility(hexStringBigInt: bigint): string {
    return hexStringToUtf8(hexStringBigInt);
}
