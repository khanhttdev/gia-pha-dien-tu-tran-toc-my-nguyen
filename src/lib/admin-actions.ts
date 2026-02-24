'use server'

import { createClient } from './supabase-server'
import { revalidatePath } from 'next/cache'

export interface AdminUserData {
    id: string
    email: string
    role: 'admin' | 'member'
    created_at: string
    is_active: boolean
}

export async function getAdminUsers() {
    const supabase = await createClient()

    // @ts-expect-error RPC types not synced
    const { data, error } = await supabase.rpc('get_admin_users')

    if (error) {
        console.error('Error fetching admin users:', error)
        return { error: error.message, data: null }
    }

    return { error: null, data: data as AdminUserData[] }
}

export async function setUserRole(userId: string, newRole: 'admin' | 'member') {
    const supabase = await createClient()

    // @ts-expect-error RPC types not synced
    const { error } = await supabase.rpc('set_user_role', {
        target_user_id: userId,
        new_role: newRole
    })

    if (error) {
        console.error('Error setting user role:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { error: null }
}

export async function deleteUser(userId: string) {
    const supabase = await createClient()

    // @ts-expect-error RPC types not synced
    const { error } = await supabase.rpc('delete_user', {
        target_user_id: userId
    })

    if (error) {
        console.error('Error deleting user:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { error: null }
}

export async function adminCreateUser(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string || 'member'
    const isActive = formData.get('is_active') === 'true'

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    // @ts-expect-error RPC types not synced
    const { data, error } = await supabase.rpc('admin_create_user', {
        new_email: email,
        new_password: password,
        new_role: role,
        new_active: isActive
    })

    if (error) {
        console.error('Error creating user:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { error: null, data }
}

export async function setUserActiveStatus(userId: string, newStatus: boolean) {
    const supabase = await createClient()

    // @ts-expect-error RPC types not synced
    const { error } = await supabase.rpc('set_user_active_status', {
        target_user_id: userId,
        new_status: newStatus
    })

    if (error) {
        console.error('Error setting active status:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/users')
    return { error: null }
}

export async function getDemographicStats() {
    const supabase = await createClient()

    // @ts-expect-error RPC types
    const { data: stats, error } = await supabase.rpc('get_demographic_stats')

    if (error) {
        console.error('Error fetching demographic stats:', error)
        return { error: error.message, data: null as any }
    }

    return { error: null, data: stats as any }
}
