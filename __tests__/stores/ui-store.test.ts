import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "@/lib/stores/ui-store";

describe("UIStore", () => {
    beforeEach(() => {
        useUIStore.setState({
            sidebarOpen: false,
            activeModal: null,
            modalData: null,
            searchDialogOpen: false,
            globalLoading: false,
        });
    });

    // ─── Sidebar ──────────────────────────────────────────────────────────────────

    it("should have sidebar closed by default", () => {
        expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it("should toggle sidebar", () => {
        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarOpen).toBe(true);

        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it("should set sidebar open explicitly", () => {
        useUIStore.getState().setSidebarOpen(true);
        expect(useUIStore.getState().sidebarOpen).toBe(true);

        useUIStore.getState().setSidebarOpen(false);
        expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it("should close sidebar", () => {
        useUIStore.getState().setSidebarOpen(true);
        useUIStore.getState().closeSidebar();
        expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    // ─── Modal ────────────────────────────────────────────────────────────────────

    it("should have no active modal by default", () => {
        expect(useUIStore.getState().activeModal).toBeNull();
        expect(useUIStore.getState().modalData).toBeNull();
    });

    it("should open modal with type and data", () => {
        useUIStore.getState().openModal("member-detail", { id: "m1" });

        const state = useUIStore.getState();
        expect(state.activeModal).toBe("member-detail");
        expect(state.modalData).toEqual({ id: "m1" });
    });

    it("should close modal and clear data", () => {
        useUIStore.getState().openModal("confirm-delete", "member-123");
        useUIStore.getState().closeModal();

        const state = useUIStore.getState();
        expect(state.activeModal).toBeNull();
        expect(state.modalData).toBeNull();
    });

    // ─── Search Dialog ────────────────────────────────────────────────────────────

    it("should have search dialog closed by default", () => {
        expect(useUIStore.getState().searchDialogOpen).toBe(false);
    });

    it("should open and close search", () => {
        useUIStore.getState().openSearch();
        expect(useUIStore.getState().searchDialogOpen).toBe(true);

        useUIStore.getState().closeSearch();
        expect(useUIStore.getState().searchDialogOpen).toBe(false);
    });

    it("should toggle search", () => {
        useUIStore.getState().toggleSearch();
        expect(useUIStore.getState().searchDialogOpen).toBe(true);

        useUIStore.getState().toggleSearch();
        expect(useUIStore.getState().searchDialogOpen).toBe(false);
    });

    // ─── Global Loading ──────────────────────────────────────────────────────────

    it("should set global loading", () => {
        useUIStore.getState().setGlobalLoading(true);
        expect(useUIStore.getState().globalLoading).toBe(true);

        useUIStore.getState().setGlobalLoading(false);
        expect(useUIStore.getState().globalLoading).toBe(false);
    });
});
