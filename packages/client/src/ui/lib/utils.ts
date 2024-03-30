import {
    Component,
    ComponentValue,
    Entity,
    Metadata,
    Schema,
    getComponentValue,
} from "@dojoengine/recs";
import { sleep } from "@latticexyz/utils";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function shortenAddress(address: string) {
    if (!address) {
        return "";
    }

    const firstPart = address.substring(0, 6);
    const lastPart = address.substring(address.length - 4);

    return `${firstPart}.....${lastPart}`;
}

export async function getComponentValueUtilNotNull<
    S extends Schema,
    T = unknown,
>(
    component: Component<S, Metadata, T>,
    entity: Entity
): Promise<ComponentValue<S, T>> {
    let value = getComponentValue<S, T>(component, entity);
    while (!value) {
        await sleep(1000);
        console.warn(`fetch ${component.schema.toString()} again`);
        value = getComponentValue<S, T>(component, entity);
    }

    return value;
}
