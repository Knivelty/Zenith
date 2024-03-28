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
