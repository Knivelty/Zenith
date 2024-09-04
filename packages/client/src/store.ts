import { create } from "zustand";
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
}

export type UIStore = {
    loggedIn: boolean;
    setLoggedIn: (loggedIn: boolean) => void;
    agreeTerm: boolean;
    setAgreeTerm: (agreeTerm: boolean) => void;
    phaserRect: DOMRect;
    setPhaserRect: (rect: DOMRect) => void;
    shows: Map<ShowItem, boolean>;
    getShow: (i: ShowItem) => boolean;
    setShow: (i: ShowItem, shouldShow: boolean) => void;
};

export const store = create<Store>(() => ({
    networkLayer: null,
    phaserLayer: null,
}));

export const useUIStore = create<UIStore>((set, get) => ({
    loggedIn: false,
    setLoggedIn: (loggedIn: boolean) => set(() => ({ loggedIn })),
    agreeTerm: false,
    setAgreeTerm: (agreeTerm: boolean) => set(() => ({ agreeTerm })),
    phaserRect: new DOMRect(0, 0, 0, 0),
    setPhaserRect: (rect: DOMRect) => set(() => ({ phaserRect: rect })),
    shows: new Map(),
    getShow: (i: ShowItem) => {
        return get().shows.get(i) || false;
    },
    setShow(i: ShowItem, shouldShow: boolean) {
        set((state) => {
            const newMap = new Map(state.shows);
            newMap.set(i, shouldShow);
            return { shows: newMap };
        });
    },
}));
