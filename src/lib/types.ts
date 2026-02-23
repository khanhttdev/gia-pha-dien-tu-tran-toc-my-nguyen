export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
    public: {
        Tables: {
            people: {
                Row: {
                    id: string
                    full_name: string
                    gender: 'male' | 'female' | 'unknown'
                    birth_year: number | null
                    death_year: number | null
                    is_alive: boolean
                    avatar_url: string | null
                    notes: string | null
                    generation: number
                    father_id: string | null
                    mother_id: string | null
                    sort_order: number
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['people']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['people']['Insert']>
            }
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                    avatar_url: string | null
                    role: 'admin' | 'viewer'
                    linked_person: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'> & {
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>
            }
        }
    }
}

// Convenient re-exports
export type Person = Database['public']['Tables']['people']['Row']
export type PersonInsert = Database['public']['Tables']['people']['Insert']
export type PersonUpdate = Database['public']['Tables']['people']['Update']
export type Profile = Database['public']['Tables']['profiles']['Row']
