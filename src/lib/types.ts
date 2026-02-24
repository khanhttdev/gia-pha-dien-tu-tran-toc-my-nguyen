import { Database } from './database.types'

export type Json = Database['public']['Tables']['contributions']['Row']['proposed_data']
export type { Database } from './database.types'

// Convenient re-exports
export type Person = Database['public']['Tables']['people']['Row']
export type PersonInsert = Database['public']['Tables']['people']['Insert']
export type PersonUpdate = Database['public']['Tables']['people']['Update']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Contribution = Database['public']['Tables']['contributions']['Row']
