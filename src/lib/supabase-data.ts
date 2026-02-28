import { createClient } from "@/lib/supabase-client";
import {
  Member,
  MemberInsert,
  MemberUpdate,
  Spouse,
  SpouseInsert,
  SpouseUpdate,
} from "./types";

const db = () => createClient();

// ─── Members ──────────────────────────────────────────────────────────────────
export async function getAllMembers(): Promise<Member[]> {
  const { data, error } = await db()
    .from("members")
    .select("*")
    .order("generation_level", { ascending: true })
    .order("birth_order", { ascending: true });

  if (error) throw error;
  return data as Member[];
}

export async function getMemberById(id: string): Promise<Member | null> {
  const { data } = await db().from("members").select("*").eq("id", id).single();
  return data as Member | null;
}

export async function searchMembers(query: string): Promise<Member[]> {
  const { data, error } = await db()
    .from("members")
    .select("*")
    .ilike("full_name", `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data as Member[];
}

export async function createMember(member: MemberInsert): Promise<Member> {
  const { data, error } = await db()
    .from("members")
    .insert({ ...member, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as Member;
}

export async function updateMember(
  id: string,
  updates: MemberUpdate,
): Promise<Member> {
  const { data, error } = await db()
    .from("members")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Member;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await db().from("members").delete().eq("id", id);
  if (error) throw error;
}

// ─── Spouses ──────────────────────────────────────────────────────────────────
export async function getAllSpouses(): Promise<Spouse[]> {
  const { data, error } = await db()
    .from("spouses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Spouse[];
}

export async function getSpousesByMemberId(
  memberId: string,
): Promise<Spouse[]> {
  const { data, error } = await db()
    .from("spouses")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Spouse[];
}

export async function createSpouse(spouse: SpouseInsert): Promise<Spouse> {
  const { data, error } = await db()
    .from("spouses")
    .insert({ ...spouse, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as Spouse;
}

export async function updateSpouse(
  id: string,
  updates: SpouseUpdate,
): Promise<Spouse> {
  const { data, error } = await db()
    .from("spouses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Spouse;
}

export async function deleteSpouse(id: string): Promise<void> {
  const { error } = await db().from("spouses").delete().eq("id", id);
  if (error) throw error;
}

export async function searchSpouses(query: string): Promise<Spouse[]> {
  const { data, error } = await db()
    .from("spouses")
    .select("*")
    .ilike("full_name", `%${query}%`)
    .limit(20);
  if (error) throw error;
  return data as Spouse[];
}

// ─── Legacy aliases ───────────────────────────────────────────────────────────
export const getAllPeople = getAllMembers;
export const getPersonById = getMemberById;
export const searchPeople = searchMembers;
export const createPerson = createMember;
export const updatePerson = updateMember as (
  id: string,
  updates: any,
) => Promise<Member>;
export const deletePerson = deleteMember;
