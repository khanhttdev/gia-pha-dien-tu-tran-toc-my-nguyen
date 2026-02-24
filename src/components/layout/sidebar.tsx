'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

import {
    Home, GitFork, Users, BookOpen, LogOut, Menu, X, Shield,
    Phone, CalendarDays, ImageIcon, UserCog, MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { Profile } from '@/lib/types'
import { GlobalSearch } from '@/components/global-search'
import { NotificationMenu } from '@/components/layout/notification-menu'


const HeritageOverlay = () => (
    <>
        <div
            className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/40 to-amber-950/90 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
    </>
)

const navItems = [
    { href: '/home', label: 'Trang Chủ', icon: Home },
    { href: '/tree', label: 'Cây Gia Phả', icon: GitFork },
    { href: '/people', label: 'Thành Viên', icon: Users },
    { href: '/directory', label: 'Danh Bạ', icon: Phone },
    { href: '/book', label: 'Sách Gia Phả', icon: BookOpen },
    { href: '/events', label: 'Sự Kiện', icon: CalendarDays },
    { href: '/media', label: 'Thư Viện', icon: ImageIcon },
    { href: '/board', label: 'Bảng Tin', icon: MessageSquare },
    { href: '/settings', label: 'Hồ Sơ', icon: UserCog },
]

interface SidebarProps {
    profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [open, setOpen] = useState(false)


    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success('Đã đăng xuất')
        router.push('/')
        router.refresh()
    }

    const navContent = (
        <div className="relative z-10 flex flex-col h-full text-amber-50">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <Link href="/home" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
                        <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                            <span className="text-lg drop-shadow-sm">🌳</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white leading-none tracking-wide">Trần Tộc</p>
                            <p className="text-xs text-amber-200/70 mt-0.5 font-medium">Mỹ Nguyên</p>
                        </div>
                    </Link>
                    <NotificationMenu />
                </div>
                <div className="mt-5">
                    <GlobalSearch />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-primary/20 text-white border border-primary/30 shadow-sm'
                                    : 'text-amber-100/70 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            {label}
                        </Link>
                    )
                })}

                {profile?.role === 'admin' && (
                    <>
                        <div className="pt-4 pb-1 px-3 mt-4 border-t border-white/10">
                            <p className="text-[10px] uppercase tracking-wider text-amber-200/50 font-bold">Quản trị</p>
                        </div>
                        <Link
                            href="/admin"
                            onClick={() => setOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                pathname.startsWith('/admin')
                                    ? 'bg-primary/20 text-white border border-primary/30 shadow-sm'
                                    : 'text-amber-100/70 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <Shield className="w-4 h-4 shrink-0" />
                            Admin Panel
                        </Link>
                    </>
                )}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-inner overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="avt" className="w-full h-full object-cover" />
                        ) : (
                            profile?.full_name?.[0]?.toUpperCase() ?? '?'
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                            {profile?.full_name ?? 'Thành viên'}
                        </p>
                        <p className="text-[10px] text-amber-200/60 truncate uppercase tracking-wider font-medium mt-0.5">
                            {profile?.role === 'admin' ? '👑 Quản trị viên' : '👤 Thành viên'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-1">

                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-amber-100/70 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Đăng xuất</span>
                    </Button>
                </div>
            </div>
        </div>

    )

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-border/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center shadow-sm">
                        <span className="text-sm drop-shadow-sm">🌳</span>
                    </div>
                    <span className="font-bold text-sm">Trần Tộc</span>
                </div>
                <div className="flex items-center gap-1">
                    <NotificationMenu />
                    <Button aria-label="Action Button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-foreground/5" onClick={() => setOpen(!open)}>
                        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside className={cn(
                'md:hidden fixed top-0 left-0 z-40 h-full w-64 flex flex-col',
                'bg-background shadow-2xl overflow-hidden',
                'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                open ? 'translate-x-0' : '-translate-x-full'
            )}>
                <HeritageOverlay />
                {navContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-background border-r border-border overflow-hidden">
                <HeritageOverlay />
                {navContent}
            </aside>
        </>
    )
}
