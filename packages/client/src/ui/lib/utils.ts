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
import d from "debug";

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
    entity: Entity,
    maxTry = 5
): Promise<ComponentValue<S, T>> {
    let value = getComponentValue<S, T>(component, entity);
    let triedTime = 1;

    if (triedTime <= maxTry) {
        triedTime += 1;
        await sleep(1000);
        logDebug(`fetch`, component.schema, "with entity", entity, "again");
        value = getComponentValue<S, T>(component, entity);
    }

    if (!value) {
        throw Error("fetch fail");
    }

    return value;
}

export function generateColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
    }

    const red = (hash & 0xff0000) >> 16;
    const green = (hash & 0x00ff00) >> 8;
    const blue = hash & 0x0000ff;

    return `rgb(${red}, ${green}, ${blue})`;
}

export function generateAvatar(address: string): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 200;

    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }

    ctx.fillStyle = generateColor(address);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(address.slice(0, 6), 100, 100);

    return canvas.toDataURL();
}

export const logDebug = d("client:debug");
export const logCall = d("debug:call");
export const logPieceIdx = d("debug:pieceIdx");
export const logPlayerAction = d("player:actions");
export const logJps = d("jps");
