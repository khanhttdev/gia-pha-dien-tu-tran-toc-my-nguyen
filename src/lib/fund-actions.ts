'use server'

import { createClient } from './supabase-server'
import { revalidatePath } from 'next/cache'

const DEFAULT_PAGE_SIZE = 20

export async function getFunds(cursor?: string, pageSize = DEFAULT_PAGE_SIZE) {
    const supabase = await createClient()

    let query = supabase
        .from('funds')
        .select(`
      *,
      member:members(id, full_name)
    `)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(pageSize + 1) // +1 để detect hasMore

    // Cursor pagination: lấy các record cũ hơn cursor (transaction_date)
    if (cursor) {
        query = query.lt('transaction_date', cursor)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching funds:', error)
        return { error: error.message, data: null, hasMore: false }
    }

    const hasMore = (data?.length ?? 0) > pageSize
    const items = hasMore ? data!.slice(0, pageSize) : (data ?? [])
    const nextCursor = hasMore ? items[items.length - 1]?.transaction_date : undefined

    return { error: null, data: items, hasMore, nextCursor }
}

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const transactionType = formData.get('transaction_type') as string
    const amountStr = formData.get('amount') as string
    const amount = Number(amountStr.replace(/,/g, ''))
    const description = formData.get('description') as string
    const transactionDate = formData.get('transaction_date') as string
    const memberId = formData.get('member_id') as string | null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: newFund, error } = await supabase
        .from('funds')
        .insert({
            transaction_type: transactionType,
            amount,
            description,
            transaction_date: transactionDate,
            member_id: memberId || null,
            created_by: user.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error adding transaction:', error)
        return { error: error.message }
    }

    if (newFund) {
        const { error: logError } = await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'INSERT',
            table_name: 'funds',
            record_id: newFund.id,
            new_data: newFund
        })
        if (logError) console.error('Error logging add transaction:', logError)
    }

    revalidatePath('/admin')
    revalidatePath('/fund')
    return { error: null }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Lấy dữ liệu cũ để ghi log
    const { data: oldData } = await supabase
        .from('funds')
        .select('*')
        .eq('id', id)
        .single()

    const { error } = await supabase
        .from('funds')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting transaction:', error)
        return { error: error.message }
    }

    if (oldData) {
        const { error: logError } = await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'DELETE',
            table_name: 'funds',
            record_id: id,
            old_data: oldData
        })
        if (logError) console.error('Error logging delete transaction:', logError)
    }

    revalidatePath('/admin')
    revalidatePath('/fund')
    return { error: null }
}

export async function getFundBalance() {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_fund_balance')

    if (error) {
        console.error('Error fetching fund balance:', error)
        return { error: error.message, balance: 0 }
    }

    return { error: null, balance: Number(data) || 0 }
}

export async function updateTransaction(id: string, formData: FormData) {
    const supabase = await createClient()

    const transactionType = formData.get('transaction_type') as string
    const amountStr = formData.get('amount') as string
    const amount = Number(amountStr.replace(/,/g, ''))
    const description = formData.get('description') as string
    const transactionDate = formData.get('transaction_date') as string
    const memberId = formData.get('member_id') as string | null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Lấy dữ liệu cũ để so sánh và ghi log
    const { data: oldData } = await supabase
        .from('funds')
        .select('*')
        .eq('id', id)
        .single()

    if (!oldData) {
        return { error: 'Không tìm thấy giao dịch này' }
    }

    const newData = {
        transaction_type: transactionType,
        amount,
        description,
        transaction_date: transactionDate,
        member_id: memberId || null,
    }

    // Update fund
    const { error: updateError } = await supabase
        .from('funds')
        .update(newData)
        .eq('id', id)

    if (updateError) {
        console.error('Error updating transaction:', updateError)
        return { error: updateError.message }
    }

    // Ghi log
    const { error: logError } = await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'UPDATE',
        table_name: 'funds',
        record_id: id,
        old_data: oldData,
        new_data: newData
    })
    if (logError) console.error('Error logging update transaction:', logError)

    revalidatePath('/admin')
    revalidatePath('/fund')
    return { error: null }
}
