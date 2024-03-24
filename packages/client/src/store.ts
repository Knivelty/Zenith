import { create } from "zustand";
import { NetworkLayer } from "./dojo/createNetworkLayer";
import { PhaserLayer } from "./phaser";
import { createRef } from "react";

export type Store = {
    networkLayer: NetworkLayer | null;
    phaserLayer: PhaserLayer | null;
};

export type UIStore = {
    loggedIn: boolean;
    setLoggedIn: () => void;
    phaserRect: DOMRect;
    setPhaserRect: (rect: DOMRect) => void;
};

export const store = create<Store>(() => ({
    networkLayer: null,
    phaserLayer: null,
}));

export const useUIStore = create<UIStore>((set) => ({
    loggedIn: false,
    setLoggedIn: () => set(() => ({ loggedIn: true })),
    phaserRect: new DOMRect(0, 0, 0, 0),
    setPhaserRect: (rect: DOMRect) => set(() => ({ phaserRect: rect })),
}));
