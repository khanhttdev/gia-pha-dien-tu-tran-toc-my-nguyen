import { create } from "zustand";

// ─── UI State Machine ──────────────────────────────────────────────────────────

export type ModalType =
    | null
    | "member-detail"
    | "member-edit"
    | "confirm-delete"
    | "search"
    | "settings";

interface UIState {
    // Sidebar
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    closeSidebar: () => void;

    // Modal
    activeModal: ModalType;
    modalData: unknown;
    openModal: (type: ModalType, data?: unknown) => void;
    closeModal: () => void;

    // Search Dialog
    searchDialogOpen: boolean;
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;

    // Global loading indicator (for nav transitions)
    globalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    // ─── Sidebar ──────────────────────────────────────────────────────────────────
    sidebarOpen: false,

    toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    },

    setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
    },

    closeSidebar: () => {
        set({ sidebarOpen: false });
    },

    // ─── Modal ────────────────────────────────────────────────────────────────────
    activeModal: null,
    modalData: null,

    openModal: (type, data = null) => {
        set({ activeModal: type, modalData: data });
    },

    closeModal: () => {
        set({ activeModal: null, modalData: null });
    },

    // ─── Search ───────────────────────────────────────────────────────────────────
    searchDialogOpen: false,

    openSearch: () => {
        set({ searchDialogOpen: true });
    },

    closeSearch: () => {
        set({ searchDialogOpen: false });
    },

    toggleSearch: () => {
        set((state) => ({ searchDialogOpen: !state.searchDialogOpen }));
    },

    // ─── Global Loading ──────────────────────────────────────────────────────────
    globalLoading: false,

    setGlobalLoading: (loading) => {
        set({ globalLoading: loading });
    },
}));
