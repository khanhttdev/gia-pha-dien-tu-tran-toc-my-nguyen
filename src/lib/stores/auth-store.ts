import { create } from "zustand";
import { createClient } from "@/lib/supabase-client";
import { APP_ROLES } from "@/lib/constants";
import type { Profile } from "@/lib/types";

// ─── State Machine ─────────────────────────────────────────────────────────────

export type AuthStatus =
    | "idle"
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | "error";

export type AppRole = (typeof APP_ROLES)[keyof typeof APP_ROLES];

interface AuthState {
    // Machine state
    status: AuthStatus;
    error: string | null;

    // Data
    userId: string | null;
    role: AppRole | null;
    profile: Profile | null;

    // Derived helpers
    isAdmin: boolean;
    isAccountant: boolean;

    // Actions (transitions)
    initialize: () => Promise<void>;
    setAuthenticated: (userId: string, profile: Profile) => void;
    clearUser: () => void;
    refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    status: "idle",
    error: null,
    userId: null,
    role: null,
    profile: null,
    isAdmin: false,
    isAccountant: false,

    initialize: async () => {
        // Guard: only initialize once from idle
        if (get().status !== "idle") return;

        set({ status: "loading", error: null });

        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                set({ status: "unauthenticated" });
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("id, full_name, email, avatar_url, role, status, linked_member")
                .eq("id", user.id)
                .single();

            const role = (profile?.role as AppRole) ?? null;

            set({
                status: "authenticated",
                userId: user.id,
                profile: profile as Profile | null,
                role,
                isAdmin: role === APP_ROLES.ADMIN,
                isAccountant: role === APP_ROLES.ACCOUNTANT,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Authentication failed";
            console.error("AuthStore.initialize:", message);
            set({ status: "error", error: message });
        }
    },

    setAuthenticated: (userId, profile) => {
        const role = (profile?.role as AppRole) ?? null;
        set({
            status: "authenticated",
            userId,
            profile,
            role,
            isAdmin: role === APP_ROLES.ADMIN,
            isAccountant: role === APP_ROLES.ACCOUNTANT,
            error: null,
        });
    },

    clearUser: () => {
        set({
            status: "unauthenticated",
            userId: null,
            profile: null,
            role: null,
            isAdmin: false,
            isAccountant: false,
            error: null,
        });
    },

    refreshProfile: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
            const supabase = createClient();
            const { data: profile } = await supabase
                .from("profiles")
                .select("id, full_name, email, avatar_url, role, status, linked_member")
                .eq("id", userId)
                .single();

            if (profile) {
                const role = (profile.role as AppRole) ?? null;
                set({
                    profile: profile as Profile,
                    role,
                    isAdmin: role === APP_ROLES.ADMIN,
                    isAccountant: role === APP_ROLES.ACCOUNTANT,
                });
            }
        } catch (err) {
            console.error("AuthStore.refreshProfile:", err);
        }
    },
}));
