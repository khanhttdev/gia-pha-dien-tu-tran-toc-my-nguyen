'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    GitFork, Users, BookOpen, Sun, Moon, LogOut, Menu, X, Shield,
    Phone, CalendarDays, ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { Profile } from '@/lib/types'

const navItems = [
    { href: '/tree', label: 'Cây Gia Phả', icon: GitFork },
    { href: '/people', label: 'Thành Viên', icon: Users },
    { href: '/directory', label: 'Danh Bạ', icon: Phone },
    { href: '/book', label: 'Sách Gia Phả', icon: BookOpen },
    { href: '/events', label: 'Sự Kiện', icon: CalendarDays },
    { href: '/media', label: 'Thư Viện', icon: ImageIcon },
]

interface SidebarProps {
    profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const supabase = createClient()
    const [open, setOpen] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        toast.success('Đã đăng xuất')
        router.push('/')
        router.refresh()
    }

    const NavContent = () => (
        <>
            {/* Logo */}
            <div className="px-6 py-5 border-b border-sidebar-border">
                <Link href="/tree" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
                    <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center shadow-lg">
                        <span className="text-lg">🌳</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-sidebar-foreground leading-none">Trần Tộc</p>
                        <p className="text-xs text-sidebar-foreground/60 mt-0.5">Mỹ Nguyên</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                            pathname.startsWith(href)
                                ? 'bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30'
                                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                    >
                        <Icon className="w-4 h-4 shrink-0" />
                        {label}
                    </Link>
                ))}

                {profile?.role === 'admin' && (
                    <>
                        <div className="pt-2 pb-1 px-3">
                            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">Quản trị</p>
                        </div>
                        <Link
                            href="/admin"
                            onClick={() => setOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                pathname.startsWith('/admin')
                                    ? 'bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/30'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                        >
                            <Shield className="w-4 h-4 shrink-0" />
                            Admin Panel
                        </Link>
                    </>
                )}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-amber-900 shrink-0">
                        {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-sidebar-foreground truncate">
                            {profile?.full_name ?? 'Thành viên'}
                        </p>
                        <p className="text-xs text-sidebar-foreground/50 truncate">
                            {profile?.role === 'admin' ? '👑 Quản trị viên' : '👁 Người xem'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 px-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 justify-start gap-2 h-8 text-xs text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Đăng xuất
                    </Button>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md gold-gradient flex items-center justify-center text-sm">🌳</div>
                    <span className="font-bold text-sm">Trần Tộc Mỹ Nguyên</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
                    {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
            </div>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside className={cn(
                'md:hidden fixed top-0 left-0 z-40 h-full w-60 flex flex-col',
                'bg-sidebar-background border-r border-sidebar-border',
                'transition-transform duration-300',
                open ? 'translate-x-0' : '-translate-x-full'
            )}>
                <NavContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-56 shrink-0 h-screen sticky top-0 bg-sidebar-background border-r border-sidebar-border">
                <NavContent />
            </aside>
        </>
    )
}
