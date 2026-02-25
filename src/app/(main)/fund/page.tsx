'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Wallet, Loader2 } from 'lucide-react'
import { FundManagerTab } from '@/components/admin/fund-manager-tab'

export default function FundPage() {
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState(false)

    useEffect(() => {
        const sb = createClient()
        sb.auth.getUser().then(({ data }) => {
            if (!data.user) return setLoading(false)
            sb.from('profiles').select('role, status').eq('id', data.user.id).single().then(({ data: profile }) => {
                if (profile && (profile.role === 'accountant' || profile.role === 'admin') && profile.status === 'approved') {
                    setHasAccess(true)
                }
                setLoading(false)
            })
        })
    }, [])

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    if (!hasAccess) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="text-5xl">🔒</div>
                    <h2 className="text-lg font-bold">Không có quyền truy cập</h2>
                    <p className="text-sm text-muted-foreground">Chỉ Thủ quỹ hoặc Admin mới có thể xem trang này</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-border glass z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-none">Quỹ Họ</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Quản lý thu chi quỹ dòng họ</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6">
                <div className="max-w-4xl mx-auto">
                    <FundManagerTab />
                </div>
            </div>
        </div>
    )
}
