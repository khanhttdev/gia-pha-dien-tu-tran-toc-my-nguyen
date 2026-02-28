"use server";

import { createClient } from "./supabase-server";
import { revalidatePath } from "next/cache";

export interface AdminUserData {
  id: string;
  email: string;
  role: "admin" | "member" | "accountant";
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

export async function getAdminUsers() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_admin_users");

  if (error) {
    console.error("Error fetching admin users:", error);
    return { error: error.message, data: null };
  }

  return { error: null, data: data as AdminUserData[] };
}

export async function setUserRole(
  userId: string,
  newRole: "admin" | "member" | "accountant",
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("set_user_role", {
    target_user_id: userId,
    new_role: newRole,
  });

  if (error) {
    console.error("Error setting user role:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null };
}

export async function setUserStatus(
  userId: string,
  newStatus: "approved" | "rejected",
) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("set_user_status", {
    target_user_id: userId,
    new_status: newStatus,
  });

  if (error) {
    console.error("Error setting user status:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_user", {
    target_user_id: userId,
  });

  if (error) {
    console.error("Error deleting user:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null };
}

export async function adminCreateUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "member";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("admin_create_user", {
    new_email: email,
    new_password: password,
    new_role: role,
    new_active: true,
  });

  if (error) {
    console.error("Error creating user:", error);
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { error: null, data };
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
