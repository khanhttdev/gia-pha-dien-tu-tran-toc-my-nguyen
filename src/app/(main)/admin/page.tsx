'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Shield, Users, Check, X, Loader2, UserCheck, UserX, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserProfile = {
    id: string
    full_name: string | null
    email: string | null
    role: 'admin' | 'viewer'
    created_at: string
    linked_person: string | null
}

type Contribution = {
    id: string
    content: string
    type: string
    status: string
    created_at: string
    author_id: string
}

export default function AdminPage() {
    const [profiles, setProfiles] = useState<UserProfile[]>([])
    const [contributions, setContributions] = useState<Contribution[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const sb = createClient() as any

    useEffect(() => {
        sb.auth.getUser().then(({ data }: any) => {
            if (!data.user) return
            setCurrentUserId(data.user.id)
            sb.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }: any) => {
                if (p?.role === 'admin') {
                    setIsAdmin(true)
                    loadData()
                } else {
                    setLoading(false)
                }
            })
        })
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [{ data: users }, { data: contribs }] = await Promise.all([
            sb.from('profiles').select('*').order('created_at', { ascending: false }),
            sb.from('contributions').select('*').order('created_at', { ascending: false }).limit(20),
        ])
        setProfiles(users ?? [])
        setContributions(contribs ?? [])
        setLoading(false)
    }

    const updateRole = async (userId: string, role: 'admin' | 'viewer') => {
        try {
            await sb.from('profiles').update({ role }).eq('id', userId)
            toast.success(`Đã đổi vai trò thành ${role === 'admin' ? 'Admin' : 'Viewer'}`)
            await loadData()
        } catch (e: any) { toast.error(e.message) }
    }

    const updateContrib = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await sb.from('contributions').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id)
            toast.success(status === 'approved' ? 'Đã duyệt' : 'Đã từ chối')
            await loadData()
        } catch (e: any) { toast.error(e.message) }
    }

    if (!isAdmin && !loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="text-5xl">🔒</div>
                    <h2 className="text-lg font-bold">Không có quyền truy cập</h2>
                    <p className="text-sm text-muted-foreground">Chỉ Admin mới có thể xem trang này</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-border glass">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-900" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none">Admin Panel</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">{profiles.length} người dùng</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={loadData}>
                        <RefreshCw className="w-3 h-3" /> Làm mới
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {/* Users management */}
                        <div>
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-500" /> Quản lý người dùng
                            </h2>
                            <div className="space-y-2">
                                {profiles.map(p => (
                                    <div key={p.id} className={cn(
                                        'glass rounded-xl p-3 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all duration-200',
                                        p.id === currentUserId && 'border-amber-400/30'
                                    )}>
                                        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                                            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-sm font-bold text-amber-900 shrink-0">
                                                {p.full_name?.[0]?.toUpperCase() ?? '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-medium truncate">{p.full_name ?? 'Chưa đặt tên'}</p>
                                                    {p.id === currentUserId && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Bạn</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 pt-2 sm:pt-0 mt-2 border-t border-border/40 sm:border-0 sm:mt-0">
                                            <Badge variant={p.role === 'admin' ? 'default' : 'secondary'} className={cn('text-[10px]', p.role === 'admin' && 'bg-amber-500/20 text-amber-600 border-amber-500/30')}>
                                                {p.role === 'admin' ? '👑 Admin' : '👁 Viewer'}
                                            </Badge>
                                            {p.id !== currentUserId && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 ml-auto sm:ml-0"
                                                    onClick={() => updateRole(p.id, p.role === 'admin' ? 'viewer' : 'admin')}
                                                >
                                                    {p.role === 'admin' ? <><UserX className="w-3 h-3" /> → Viewer</> : <><UserCheck className="w-3 h-3" /> → Admin</>}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contributions */}
                        {contributions.length > 0 && (
                            <div>
                                <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-amber-500" /> Đóng Góp / Đề Xuất ({contributions.filter(c => c.status === 'pending').length} chờ duyệt)
                                </h2>
                                <div className="space-y-2">
                                    {contributions.map(c => (
                                        <div key={c.id} className="glass rounded-xl p-3 border border-border/60">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                                        {c.type === 'edit' ? '📝 Chỉnh sửa' : c.type === 'add' ? '➕ Thêm mới' : c.type === 'delete' ? '🗑️ Xoá' : '💬 Bình luận'}
                                                    </p>
                                                    <p className="text-sm text-foreground">{c.content}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString('vi-VN')}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Badge variant={c.status === 'pending' ? 'outline' : c.status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                                                        {c.status === 'pending' ? '⏳ Chờ' : c.status === 'approved' ? '✅ Đã duyệt' : '❌ Từ chối'}
                                                    </Badge>
                                                    {c.status === 'pending' && (
                                                        <div className="flex gap-1 ml-1">
                                                            <Button size="icon" variant="outline" className="h-7 w-7 hover:text-green-500" onClick={() => updateContrib(c.id, 'approved')}><Check className="w-3.5 h-3.5" /></Button>
                                                            <Button size="icon" variant="outline" className="h-7 w-7 hover:text-red-500" onClick={() => updateContrib(c.id, 'rejected')}><X className="w-3.5 h-3.5" /></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
