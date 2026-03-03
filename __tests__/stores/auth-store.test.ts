import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/stores/auth-store";

describe("AuthStore", () => {
    beforeEach(() => {
        // Reset store to initial state before each test
        useAuthStore.setState({
            status: "idle",
            error: null,
            userId: null,
            role: null,
            profile: null,
            isAdmin: false,
            isAccountant: false,
        });
    });

    it("should have correct initial state", () => {
        const state = useAuthStore.getState();

        expect(state.status).toBe("idle");
        expect(state.error).toBeNull();
        expect(state.userId).toBeNull();
        expect(state.role).toBeNull();
        expect(state.profile).toBeNull();
        expect(state.isAdmin).toBe(false);
        expect(state.isAccountant).toBe(false);
    });

    it("should set authenticated state with setAuthenticated", () => {
        const mockProfile: any = {
            id: "user-123",
            full_name: "Trần Văn A",
            email: "a@test.com",
            role: "admin",
            avatar_url: null,
            status: "approved",
            linked_member: null,
            created_at: null,
            updated_at: null,
        };

        useAuthStore.getState().setAuthenticated("user-123", mockProfile);

        const state = useAuthStore.getState();
        expect(state.status).toBe("authenticated");
        expect(state.userId).toBe("user-123");
        expect(state.profile).toEqual(mockProfile);
        expect(state.role).toBe("admin");
        expect(state.isAdmin).toBe(true);
        expect(state.isAccountant).toBe(false);
        expect(state.error).toBeNull();
    });

    it("should set accountant role correctly", () => {
        const mockProfile: any = {
            id: "user-456",
            full_name: "Trần Thị B",
            role: "accountant",
        };

        useAuthStore.getState().setAuthenticated("user-456", mockProfile);

        const state = useAuthStore.getState();
        expect(state.isAdmin).toBe(false);
        expect(state.isAccountant).toBe(true);
        expect(state.role).toBe("accountant");
    });

    it("should clear user state with clearUser", () => {
        // First set authenticated
        useAuthStore.getState().setAuthenticated("user-123", {
            id: "user-123",
            full_name: "Test",
            role: "admin",
        } as any);

        expect(useAuthStore.getState().status).toBe("authenticated");

        // Then clear
        useAuthStore.getState().clearUser();

        const state = useAuthStore.getState();
        expect(state.status).toBe("unauthenticated");
        expect(state.userId).toBeNull();
        expect(state.profile).toBeNull();
        expect(state.role).toBeNull();
        expect(state.isAdmin).toBe(false);
        expect(state.isAccountant).toBe(false);
        expect(state.error).toBeNull();
    });

    it("should not re-initialize if already past idle", () => {
        // Set to authenticated (past idle)
        useAuthStore.setState({ status: "authenticated" });

        // Calling initialize should not change state (it guards against non-idle)
        useAuthStore.getState().initialize();

        // Status should remain authenticated (not loading)
        expect(useAuthStore.getState().status).toBe("authenticated");
    });
});
