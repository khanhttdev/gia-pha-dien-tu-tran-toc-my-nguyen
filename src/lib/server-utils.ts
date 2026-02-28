import { createClient } from "./supabase-server";
import { APP_ROLES } from "./constants";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "./types";

export type VerifyAdminResponse =
    | { error: string; user: null; supabase: null }
    | { error: string; user: User; supabase: null }
    | { error: null; user: User; supabase: SupabaseClient<Database> };

/**
 * Utility to verify if the current user has the admin role.
 */
export async function verifyAdmin(): Promise<VerifyAdminResponse> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Vui lòng đăng nhập để thực hiện hành động này", user: null, supabase: null };
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== APP_ROLES.ADMIN) {
        return { error: "Bạn không có quyền quản trị để thực hiện hành động này", user, supabase: null };
    }

    return { error: null, user, supabase };
}

/**
 * Standardized error handler for Server Actions
 */
export async function actionHandler<T>(
    action: () => Promise<T>
): Promise<{ error: string | null; data: T | null }> {
    try {
        const data = await action();
        return { error: null, data };
    } catch (error: any) {
        console.error("Server Action Error:", error);
        return {
            error: error.message || "Đã xảy ra lỗi không xác định trên hệ thống",
            data: null
        };
    }
}
