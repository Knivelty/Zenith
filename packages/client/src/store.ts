import { create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { NetworkLayer } from "./dojo/createNetworkLayer";
import { PhaserLayer } from "./phaser";
import { num } from "starknet";
import { battle } from "./phaser/systems/battle";

export type Store = {
    networkLayer: NetworkLayer | null;
    phaserLayer: PhaserLayer | null;
};

export enum ShowItem {
    Shade,
    Shop,
    HeroInfoDialog,
    CurseDetail,
    CurseNotice,
    SettleDialog,
    MakeChoice,
    DangerStage,
    GuestTips,
    ConnectWalletDialog,
    SessionWalletCreate,
    AccountOption,
    QuitConfirmation,
    OptionMenuUnfold,
    SynergyDetail,
    Setting,
}

export type Volume = {
    battleBgm: number;
    effect: number;
};

export type UIStore = {
    phaserRect: DOMRect;
    setPhaserRect: (rect: DOMRect) => void;
    shows: Map<ShowItem, boolean>;
    getShow: (i: ShowItem) => boolean;
    setShow: (i: ShowItem, shouldShow: boolean) => void;
};

export type PersistUIStore = {
    loggedIn: boolean;
    setLoggedIn: (loggedIn: boolean) => void;
    agreeTerm: boolean;
    setAgreeTerm: (agreeTerm: boolean) => void;
    soundVolumes: Volume;
    setVolume: (v: Partial<Volume>) => void;
};

export const store = create<Store>(() => ({
    networkLayer: null,
    phaserLayer: null,
}));

export const persistUIStore = createStore(
    persist<PersistUIStore>(
        (set) => ({
            loggedIn: false,
            setLoggedIn: (loggedIn: boolean) => set(() => ({ loggedIn })),
            agreeTerm: false,
            setAgreeTerm: (agreeTerm: boolean) => set(() => ({ agreeTerm })),
            soundVolumes: { battleBgm: 100, effect: 100 },
            setVolume: (v: Partial<Volume>) =>
                set(({ soundVolumes }) => ({
                    soundVolumes: { ...soundVolumes, ...v },
                })),
        }),

        {
            name: "ui-persist-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const usePersistUIStore = <T>(selector: (state: PersistUIStore) => T) =>
    useStore(persistUIStore, selector);

export const useUIStore = create<UIStore>()((set, get) => ({
    phaserRect: new DOMRect(0, 0, 0, 0),
    setPhaserRect: (rect: DOMRect) => set(() => ({ phaserRect: rect })),
    shows: new Map<ShowItem, boolean>(),
    getShow: (i: ShowItem) => get().shows.get(i) ?? false,
    setShow(i: ShowItem, shouldShow: boolean) {
        set(() => {
            // create a new map to trigger react re-render
            const newMap = new Map(get().shows);
            newMap.set(i, shouldShow);
            return { shows: newMap };
        });
    },
}));
