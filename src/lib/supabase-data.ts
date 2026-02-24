import { createClient } from '@/lib/supabase-client'
import { Person, PersonInsert, PersonUpdate } from './types'

const db = () => createClient()

// ─── People ───────────────────────────────────────────────────────────────────
export async function getAllPeople(): Promise<Person[]> {
    const { data, error } = await db()
        .from('people')
        .select('*')
        .order('generation', { ascending: true })
        .order('sort_order', { ascending: true })

    if (error) throw error
    return data as Person[]
}

export async function getPersonById(id: string): Promise<Person | null> {
    const { data } = await db().from('people').select('*').eq('id', id).single()
    return data as Person | null
}

export async function searchPeople(query: string): Promise<Person[]> {
    const { data, error } = await db()
        .from('people')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .limit(20)
    if (error) throw error
    return data as Person[]
}

export async function createPerson(person: PersonInsert): Promise<Person> {
    const { data, error } = await db()
        .from('people')
        .insert({ ...person, updated_at: new Date().toISOString() })
        .select()
        .single()
    if (error) throw error
    return data as Person
}

export async function updatePerson(id: string, updates: PersonUpdate): Promise<Person> {
    const { data, error } = await db()
        .from('people')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as Person
}

export async function deletePerson(id: string): Promise<void> {
    const { error } = await db().from('people').delete().eq('id', id)
    if (error) throw error
}
