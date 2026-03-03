"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores";

/**
 * Backward-compatible auth hook that delegates to the AuthStore state machine.
 * Components using `useAuth()` continue to work with the same API.
 */
export function useAuth() {
    const status = useAuthStore((s) => s.status);
    const userId = useAuthStore((s) => s.userId);
    const isAdmin = useAuthStore((s) => s.isAdmin);
    const initialize = useAuthStore((s) => s.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return {
        currentUserId: userId,
        isAdmin,
        loading: status === "idle" || status === "loading",
    };
}
