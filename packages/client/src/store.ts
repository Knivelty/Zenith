import { create, useStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { NetworkLayer } from "./dojo/createNetworkLayer";
import { PhaserLayer } from "./phaser";

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
    GameOverDialog,
    GuidePage,
    GeneralGuide,
    InterActiveGuide,
}

export type Volume = {
    music: number;
    effect: number;
};

export type UIStore = {
    phaserRect: DOMRect;
    setPhaserRect: (rect: DOMRect) => void;
    shows: Map<ShowItem, boolean>;
    getShow: (i: ShowItem) => boolean;
    setShow: (i: ShowItem, shouldShow: boolean) => void;
    guideIndex: number;
    guideRun: boolean;
    setField: <K extends keyof UIStore>(field: K, value: UIStore[K]) => void;
};

export type PersistUIStore = {
    loggedIn: boolean;
    setLoggedIn: (loggedIn: boolean) => void;
    agreeTerm: boolean;
    setAgreeTerm: (agreeTerm: boolean) => void;
    skipGuide: boolean;
    setSkipGuide: (skipGuide: boolean) => void;
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
            skipGuide: false,
            setSkipGuide: (skipGuide: boolean) => set(() => ({ skipGuide })),
            soundVolumes: { music: 100, effect: 100 },
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
    guideRun: false,
    guideIndex: 0,
    setField: <K extends keyof UIStore>(field: K, value: UIStore[K]) =>
        set({ [field]: value }),
}));
