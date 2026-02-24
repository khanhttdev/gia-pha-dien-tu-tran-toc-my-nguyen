'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { Contribution } from '@/lib/types'

/**
 * Lấy danh sách đóng góp hợp lệ hiển thị lên Bảng tin (Newsfeed).
 * Chỉ trả về những items có status 'approved', hoặc trả về toàn bộ của User hiện tại (xem được cả pending/rejected).
 */
export async function getBoardFeed() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Không tìm thấy thông tin đăng nhập', data: null }
    }

    // Vì RLS policy cho phép mọi user xem được "approved" VÀ những cái của chính "auth.uid()", 
    // chúng ta chỉ cần select là Supabase sẽ tự động lọc theo Rule đó, nhưng để rõ ràng hơn ta có thể lọc explicitly hoặc để RLS lo.
    // Ở đây ta cứ fetch, RLS sẽ chặn những bài "pending" hoặc "rejected" của NGƯỜI KHÁC.
    const { data, error } = await supabase
        .from('contributions')
        .select(`
            *,
            author:profiles!contributions_author_id_fkey(full_name, avatar_url),
            comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('Error fetching board feed:', error)
        return { error: error.message, data: null }
    }

    return { error: null, data: data as any[] }
}

/**
 * Gửi đóng góp / đề xuất mới. Mặc định status sẽ là 'pending'.
 */
export async function submitContribution(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Vui lòng đăng nhập để gửi đóng góp' }
    }

    const content = formData.get('content') as string
    const type = formData.get('type') as string

    if (!content || !type) {
        return { error: 'Vui lòng nhập đầy đủ nội dung và loại đóng góp' }
    }

    const { error } = await supabase
        .from('contributions')
        .insert({
            author_id: user.id,
            content: content,
            type: type,
            status: 'pending'
        })

    if (error) {
        console.error('Error submitting contribution:', error)
        return { error: error.message }
    }

    revalidatePath('/board')
    return { error: null }
}

/**
 * Lấy danh sách bình luận của một bài đăng.
 */
export async function getComments(contributionId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .eq('contribution_id', contributionId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching comments:', error)
        return { error: error.message, data: null }
    }

    return { error: null, data: data as any[] }
}

/**
 * Thêm bình luận mới.
 */
export async function addComment(contributionId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Vui lòng đăng nhập để bình luận' }
    }

    if (!content.trim()) {
        return { error: 'Nội dung bình luận không được để trống' }
    }

    const { error } = await supabase
        .from('comments')
        .insert({
            contribution_id: contributionId,
            author_id: user.id,
            content: content.trim()
        })

    if (error) {
        console.error('Error adding comment:', error)
        return { error: error.message }
    }

    revalidatePath('/board')
    return { error: null }
}
