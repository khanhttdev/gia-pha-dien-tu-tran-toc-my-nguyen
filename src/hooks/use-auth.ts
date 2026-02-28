"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { APP_ROLES } from "@/lib/constants";

export function useAuth() {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const sb = createClient();
            try {
                const {
                    data: { user },
                } = await sb.auth.getUser();

                if (user) {
                    setCurrentUserId(user.id);
                    const { data: profile } = await sb
                        .from("profiles")
                        .select("role")
                        .eq("id", user.id)
                        .single();
                    setIsAdmin(profile?.role === APP_ROLES.ADMIN);
                }
            } catch (error) {
                console.error("Error in useAuth:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { currentUserId, isAdmin, loading };
}
