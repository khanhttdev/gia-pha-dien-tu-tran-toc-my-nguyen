"use server";

import { createClient } from "./supabase-server";
import { revalidatePath } from "next/cache";
import { APP_ROLES, APP_STATUS, APP_PATHS } from "./constants";
import { verifyAdmin, actionHandler } from "./server-utils";

export interface AdminUserData {
  id: string;
  email: string;
  role: typeof APP_ROLES[keyof typeof APP_ROLES];
  created_at: string;
  status: typeof APP_STATUS[keyof typeof APP_STATUS];
}

export async function getAdminUsers() {
  return actionHandler(async () => {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    const { data, error } = await adminCheck.supabase!.rpc("get_admin_users");
    if (error) throw error;
    return data as AdminUserData[];
  });
}

export async function setUserRole(
  userId: string,
  newRole: typeof APP_ROLES[keyof typeof APP_ROLES],
) {
  return actionHandler(async () => {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    const { error } = await adminCheck.supabase!.rpc("set_user_role", {
      target_user_id: userId,
      new_role: newRole,
    });

    if (error) throw error;
    revalidatePath(APP_PATHS.ADMIN);
    return true;
  });
}

export async function setUserStatus(
  userId: string,
  newStatus: typeof APP_STATUS.APPROVED | typeof APP_STATUS.REJECTED,
) {
  return actionHandler(async () => {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    const { error } = await adminCheck.supabase!.rpc("set_user_status", {
      target_user_id: userId,
      new_status: newStatus,
    });

    if (error) throw error;
    revalidatePath(APP_PATHS.ADMIN);
    return true;
  });
}

export async function deleteUser(userId: string) {
  return actionHandler(async () => {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    const { error } = await adminCheck.supabase!.rpc("delete_user", {
      target_user_id: userId,
    });

    if (error) throw error;
    revalidatePath(APP_PATHS.ADMIN);
    return true;
  });
}

export async function adminCreateUser(formData: FormData) {
  return actionHandler(async () => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || APP_ROLES.MEMBER;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    const { data, error } = await adminCheck.supabase!.rpc("admin_create_user", {
      new_email: email,
      new_password: password,
      new_role: role,
      new_active: true,
    });

    if (error) throw error;
    revalidatePath(APP_PATHS.ADMIN);
    return data;
  });
}

/**
 * Xóa media khỏi thư viện (Admin only)
 */
export async function deleteMedia(id: string) {
  return actionHandler(async () => {
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) throw new Error(adminCheck.error);

    const { error } = await adminCheck.supabase!.from("media").delete().eq("id", id);
    if (error) throw error;

    revalidatePath(APP_PATHS.MEDIA);
    return true;
  });
}

export async function getDemographicStats() {
  const supabase = await createClient();

  const { data: stats, error } = await supabase.rpc("get_demographic_stats");

  if (error) {
    console.error("Error fetching demographic stats:", error);
    return { error: error.message, data: null as any };
  }

  return { error: null, data: stats as any };
}
