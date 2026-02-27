import { createClient } from '@/lib/supabase-server'
import TreeClient from './tree-client'

export const metadata = {
    title: 'Cây Gia Phả | Trần Tộc Mỹ Nguyên',
}

export default async function TreePage() {
    const supabase = await createClient()

    let defaultRootId: string | null = null

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        // 2. Lấy link_member từ profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('linked_member')
            .eq('id', user.id)
            .single()

        if (profile?.linked_member) {
            // 3. Truy xuất id ông nội qua Supabase RPC Function (ép kiểu do type db chưa sync)
            const { data: grandfatherId } = await (supabase.rpc as any)('get_grandfather_id', {
                p_member_id: profile.linked_member
            })
            // Nếu không có kết quả từ RPC, lùi về lấy chính người đó làm Root
            defaultRootId = (grandfatherId as string) || profile.linked_member
        }
    }

    return <TreeClient defaultRootId={defaultRootId} />
}
