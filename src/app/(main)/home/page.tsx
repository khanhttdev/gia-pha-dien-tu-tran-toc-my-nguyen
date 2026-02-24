import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Person } from '@/lib/types'
import {
    GitFork, Users, BookOpen, CalendarDays, ImageIcon,
    Phone, TrendingUp, Clock, MessageSquare
} from 'lucide-react'

const quickLinks = [
    { href: '/tree', label: 'Cây Gia Phả', icon: GitFork, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
    { href: '/people', label: 'Thành Viên', icon: Users, color: 'from-blue-500/20 to-indigo-500/20', iconColor: 'text-blue-400' },
    { href: '/directory', label: 'Danh Bạ', icon: Phone, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
    { href: '/book', label: 'Sách Gia Phả', icon: BookOpen, color: 'from-rose-500/20 to-pink-500/20', iconColor: 'text-rose-400' },
    { href: '/events', label: 'Sự Kiện', icon: CalendarDays, color: 'from-cyan-500/20 to-sky-500/20', iconColor: 'text-cyan-400' },
    { href: '/media', label: 'Thư Viện Ảnh', icon: ImageIcon, color: 'from-slate-500/20 to-gray-500/20', iconColor: 'text-slate-400' },
    { href: '/board', label: 'Bảng Tin', icon: MessageSquare, color: 'from-amber-500/20 to-yellow-500/20', iconColor: 'text-amber-400' },
]

const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Gần đây'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    return `${days} ngày trước`
}

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single() as { data: { full_name: string | null; role: string } | null }

    // Fetch stats
    const { count: totalMembers } = await supabase
        .from('people')
        .select('*', { count: 'exact', head: true })

    const { data: genData } = await supabase
        .from('people')
        .select('generation')
        .order('generation', { ascending: false })
        .limit(1)
        .single() as { data: { generation: number } | null }

    // Recent updates
    const { data: recentPeople } = await supabase
        .from('people')
        .select('id, full_name, gender, generation, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5) as { data: Pick<Person, 'id' | 'full_name' | 'gender' | 'generation' | 'updated_at'>[] | null }

    const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Thành viên'
    const maxGen = genData?.generation ?? 0

    return (
        <div aria-label="home" className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 page-enter">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-amber-500/5 to-rose-500/10 rounded-2xl" />
                <div className="absolute inset-0 glass rounded-2xl" />
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">👋</span>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                            Chào mừng, <span className="gold-text">{displayName}</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium ml-12">
                        Chúc bạn một ngày tốt lành cùng đại gia đình Trần Tộc Mỹ Nguyên 🌳
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5 border border-border/30 group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Thành viên</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-foreground">{totalMembers ?? 0}</div>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/30 group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Thế hệ</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-foreground">{maxGen}</div>
                </div>

                <div className="glass rounded-2xl p-5 border border-border/30 group hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cập nhật gần đây</span>
                    </div>
                    <div className="text-3xl font-serif font-bold text-foreground">{recentPeople?.length ?? 0}</div>
                </div>
            </div>

            {/* Quick Access */}
            <div>
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Truy cập nhanh</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group relative p-4 rounded-xl glass border border-border/30 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg text-center"
                        >
                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <div className="relative z-10">
                                <div className={`w-10 h-10 mx-auto rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-2 ${link.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <link.icon className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold text-foreground/80 group-hover:text-foreground">{link.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            {recentPeople && recentPeople.length > 0 && (
                <div>
                    <h2 className="text-xl font-serif font-bold text-foreground mb-4">Hoạt động gần đây</h2>
                    <div className="glass rounded-2xl border border-border/30 divide-y divide-border/20 overflow-hidden">
                        {recentPeople.map((person) => (
                            <Link
                                key={person.id}
                                href={`/people`}
                                className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                    {person.full_name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{person.full_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Đời {person.generation} · {person.gender === 'male' ? 'Nam' : person.gender === 'female' ? 'Nữ' : ''}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground/70 shrink-0">
                                    {getTimeAgo(person.updated_at)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
