'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Shield, Users, Check, X, Loader2, UserCheck, UserX, RefreshCw, ClipboardList, Plus, Trash2, BarChart3, Wallet, MessageSquare } from 'lucide-react'
import { adminCreateUser, deleteUser, setUserRole } from '@/lib/admin-actions'
import { cn } from '@/lib/utils'
import { Profile as UserProfile, Contribution, ActivityLog } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import New Subcomponents
import { AnalyticsTab } from '@/components/admin/analytics-tab'
import { FundManagerTab } from '@/components/admin/fund-manager-tab'

export default function AdminPage() {
    const [profiles, setProfiles] = useState<UserProfile[]>([])
    const [contributions, setContributions] = useState<Contribution[]>([])
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const [showAddUser, setShowAddUser] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newRole, setNewRole] = useState<'admin' | 'member'>('member')
    const [isCreatingUser, setIsCreatingUser] = useState(false)

    const sb = createClient()

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
        const [{ data: users }, { data: contribs }, { data: history }] = await Promise.all([
            sb.from('profiles').select('*').order('created_at', { ascending: false }),
            sb.from('contributions').select('*').order('created_at', { ascending: false }).limit(20),
            sb.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
        ])
        setProfiles(users ?? [])
        setContributions(contribs ?? [])
        setLogs(history ?? [])
        setLoading(false)
    }

    const updateRole = async (userId: string, role: 'admin' | 'member') => {
        try {
            const res = await setUserRole(userId, role)
            if (res.error) throw new Error(res.error)
            toast.success(`Đã đổi vai trò thành ${role === 'admin' ? 'Admin' : 'Member'}`)
            await loadData()
        } catch (e: any) { toast.error(e.message) }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail || !newPassword) return toast.error('Vui lòng nhập email và mật khẩu')
        setIsCreatingUser(true)
        const formData = new FormData()
        formData.append('email', newEmail)
        formData.append('password', newPassword)
        formData.append('role', newRole)
        formData.append('is_active', 'true')

        const res = await adminCreateUser(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Đã tạo người dùng thành công')
            setShowAddUser(false)
            setNewEmail('')
            setNewPassword('')
            setNewRole('member')
            await loadData()
        }
        setIsCreatingUser(false)
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return
        const res = await deleteUser(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Đã xóa người dùng')
            await loadData()
        }
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
            <div className="shrink-0 px-6 py-4 border-b border-border glass z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                            <Shield className="w-4 h-4 text-amber-900" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none">Admin Panel</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Quản lý Gia phả & Dòng họ</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs bg-background/50 backdrop-blur-sm" onClick={loadData}>
                        <RefreshCw className="w-3 h-3" /> <span className="hidden sm:inline">Làm mới</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                    <Tabs defaultValue="analytics" className="w-full max-w-5xl mx-auto">
                        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-2 md:gap-0 bg-transparent p-0 mb-6 border-b border-border/40 pb-2 overflow-x-auto justify-start">
                            <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2"><BarChart3 className="w-4 h-4" /><span className="hidden sm:inline">Thống Kê</span></TabsTrigger>
                            <TabsTrigger value="users" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2"><Users className="w-4 h-4" /><span className="hidden sm:inline">Người Dùng</span></TabsTrigger>
                            <TabsTrigger value="funds" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500/50 border border-transparent rounded-full px-4 py-2 gap-2"><Wallet className="w-4 h-4" /><span className="hidden sm:inline">Quỹ Họ</span></TabsTrigger>
                            <TabsTrigger value="contributions" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2 relative">
                                <MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">Đề Xuất</span>
                                {contributions.filter(c => c.status === 'pending').length > 0 && (
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/50 border border-transparent rounded-full px-4 py-2 gap-2"><ClipboardList className="w-4 h-4" /><span className="hidden sm:inline">Nhật Ký</span></TabsTrigger>
                        </TabsList>

                        {/* TAB: THỐNG KÊ */}
                        <TabsContent value="analytics" className="animate-in fade-in-50 duration-500 outline-none">
                            <AnalyticsTab />
                        </TabsContent>

                        {/* TAB: QUỸ HỌ */}
                        <TabsContent value="funds" className="animate-in fade-in-50 duration-500 outline-none">
                            <FundManagerTab />
                        </TabsContent>

                        {/* TAB: NGƯỜI DÙNG */}
                        <TabsContent value="users" className="animate-in fade-in-50 duration-500 outline-none space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold flex items-center gap-2">
                                    <Users className="w-4 h-4 text-amber-500" /> Quản lý người dùng ({profiles.length})
                                </h2>
                                <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setShowAddUser(!showAddUser)}>
                                    <Plus className="w-3 h-3" /> Thêm mới
                                </Button>
                            </div>

                            {showAddUser && (
                                <form onSubmit={handleAddUser} className="glass rounded-xl p-4 border border-amber-500/30 flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2">
                                    <div className="flex-1 min-w-[200px] space-y-1.5">
                                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Email</label>
                                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="email@example.com" />
                                    </div>
                                    <div className="flex-1 min-w-[200px] space-y-1.5">
                                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Mật khẩu</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50" placeholder="******" />
                                    </div>
                                    <div className="w-[120px] space-y-1.5">
                                        <label className="text-[10px] text-muted-foreground uppercase font-bold">Vai trò</label>
                                        <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50">
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <Button type="submit" disabled={isCreatingUser} className="h-9 shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
                                        {isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu'}
                                    </Button>
                                </form>
                            )}

                            <div className="space-y-2">
                                {profiles.map(p => (
                                    <div key={p.id} className={cn(
                                        'glass rounded-xl p-3 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-all duration-200 hover:bg-white/5',
                                        p.id === currentUserId && 'border-amber-400/30'
                                    )}>
                                        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-sm font-bold text-amber-900 shrink-0">
                                                {p.full_name?.[0]?.toUpperCase() ?? '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-medium truncate">{p.full_name ?? 'Chưa đặt tên'}</p>
                                                    {p.id === currentUserId && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-500">Bạn</Badge>}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                                                <p className="text-[10px] text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString('vi-VN') : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:shrink-0 pt-2 sm:pt-0 mt-2 border-t border-border/40 sm:border-0 sm:mt-0">
                                            <Badge variant={p.role === 'admin' ? 'default' : 'secondary'} className={cn('text-[10px]', p.role === 'admin' && 'bg-amber-500/20 text-amber-600 border-amber-500/30')}>
                                                {p.role === 'admin' ? '👑 Admin' : '👁 Member'}
                                            </Badge>
                                            {p.id !== currentUserId && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs gap-1 ml-auto sm:ml-0"
                                                        onClick={() => updateRole(p.id, p.role === 'admin' ? 'member' : 'admin')}
                                                    >
                                                        {p.role === 'admin' ? <><UserX className="w-3 h-3" /> → Member</> : <><UserCheck className="w-3 h-3" /> → Admin</>}
                                                    </Button>
                                                    <Button aria-label="Action Button" variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                        title="Xóa người dùng"
                                                        onClick={() => handleDeleteUser(p.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* TAB: CONTRIBUTIONS */}
                        <TabsContent value="contributions" className="animate-in fade-in-50 duration-500 outline-none">
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-amber-500" /> Đóng Góp / Đề Xuất ({contributions.filter(c => c.status === 'pending').length} chờ duyệt)
                            </h2>
                            {contributions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Không có đóng góp nào.</p>
                            ) : (
                                <div className="space-y-2">
                                    {contributions.map(c => (
                                        <div key={c.id} className="glass rounded-xl p-4 border border-border/60">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase">{c.type}</Badge>
                                                        <span className="text-[10px] text-muted-foreground">{c.created_at ? new Date(c.created_at).toLocaleString('vi-VN') : ''}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground mb-1">{c.content}</p>
                                                </div>
                                                <div className="flex items-center gap-2 sm:shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                                                    <Badge variant={c.status === 'pending' ? 'outline' : c.status === 'approved' ? 'default' : 'secondary'} className={cn(
                                                        "text-[10px]",
                                                        c.status === 'approved' && "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
                                                        c.status === 'rejected' && "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )}>
                                                        {c.status === 'pending' ? '⏳ Chờ duyệt' : c.status === 'approved' ? '✅ Đã duyệt' : '❌ Đã từ chối'}
                                                    </Badge>
                                                    {c.status === 'pending' && (
                                                        <div className="flex gap-1 ml-auto sm:ml-2">
                                                            <Button aria-label="Action Button" size="sm" variant="outline" className="h-8 gap-1 hover:text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20" onClick={() => updateContrib(c.id, 'approved')}><Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Duyệt</span></Button>
                                                            <Button aria-label="Action Button" size="sm" variant="outline" className="h-8 gap-1 hover:text-red-500 hover:bg-red-500/10 border-red-500/20" onClick={() => updateContrib(c.id, 'rejected')}><X className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Từ chối</span></Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        {/* TAB: ACTIVITY LOGS */}
                        <TabsContent value="logs" className="animate-in fade-in-50 duration-500 outline-none">
                            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-amber-500" /> Nhật Ký Hoạt Động (Gần nhất)
                            </h2>
                            {logs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Chưa có hoạt động nào được ghi lại.</p>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map(log => {
                                        const user = profiles.find(p => p.id === log.user_id)
                                        return (
                                            <div key={log.id} className="glass rounded-xl p-3 border border-border/60 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    <Badge variant="outline" className={cn(
                                                        'text-[10px] px-1.5 py-0 border',
                                                        log.action === 'INSERT' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                            log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                                    )}>
                                                        {log.action}
                                                    </Badge>
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{log.table_name}</span>
                                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                                        {new Date(log.created_at).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                                    <span className="font-bold text-foreground bg-background/50 px-1.5 py-0.5 rounded">{user?.full_name || 'System'}</span>
                                                    <span className="text-muted-foreground">đã {log.action === 'INSERT' ? 'thêm mới' : log.action === 'UPDATE' ? 'cập nhật' : 'xoá'} record ID</span>
                                                    <span className="font-mono text-[10px] bg-secondary/30 px-1.5 py-0.5 rounded text-muted-foreground">{log.record_id}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    )
}
