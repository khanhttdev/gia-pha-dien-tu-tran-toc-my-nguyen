'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, MessageSquare, Users, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, addDays, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

import { toast } from 'sonner'

type NotifEvent = {
    id: string
    title: string
    event_date: string
    type: string | null
}

type RealtimeNotif = {
    id: string
    message: string
    type: 'board' | 'member' | 'system'
    timestamp: Date
    read: boolean
}

export function NotificationMenu() {
    const [events, setEvents] = useState<NotifEvent[]>([])
    const [realtimeNotifs, setRealtimeNotifs] = useState<RealtimeNotif[]>([])
    const [open, setOpen] = useState(false)
    const [pushStatus, setPushStatus] = useState<NotificationPermission>('default')
    const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

    useEffect(() => {
        if ('Notification' in window) {
            setPushStatus(Notification.permission)
        }
    }, [])

    const handleSubscribePush = async () => {
        if (!('Notification' in window)) {
            toast.error('Trình duyệt không hỗ trợ Push Notification')
            return
        }
        try {
            const permission = await Notification.requestPermission()
            setPushStatus(permission)
            if (permission === 'granted') {
                toast.success('Đã bật thông báo thành công!')
            } else if (permission === 'denied') {
                toast.info('Bạn đã từ chối nhận thông báo.')
            }
        } catch (error) {
            console.error('Error requesting push permission:', error)
        }
    }

    const totalUnread = realtimeNotifs.filter(n => !n.read).length +
        (() => {
            const seen: string[] = JSON.parse(localStorage.getItem('seen_notifications') || '[]')
            return events.filter(e => !seen.includes(e.id)).length
        })()

    // ── Fetch upcoming events (one-time) ──────────────────────────────────────
    useEffect(() => {
        const fetchEvents = async () => {
            const sb = createClient()
            const today = new Date()
            const next30Days = addDays(today, 30)

            const { data } = await sb
                .from('events')
                .select('id, title, event_date, type')
                .gte('event_date', today.toISOString().split('T')[0])
                .lte('event_date', next30Days.toISOString().split('T')[0])
                .order('event_date', { ascending: true })
                .limit(5)

            if (data) setEvents(data)
        }
        fetchEvents()
    }, [])

    // ── Supabase Realtime: listen to new board posts ───────────────────────────
    useEffect(() => {
        const sb = createClient()

        const channel = sb
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'contributions',
                    filter: 'status=eq.approved'
                },
                (payload) => {
                    const row = payload.new as any
                    const msg = row.content?.length > 60
                        ? row.content.slice(0, 60) + '...'
                        : (row.content ?? 'Bài đăng mới')
                    addRealtimeNotif({
                        id: `board-${row.id}`,
                        message: `📢 Bảng tin mới: ${msg}`,
                        type: 'board',
                        timestamp: new Date(),
                        read: false,
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'members',
                },
                (payload) => {
                    const row = payload.new as any
                    addRealtimeNotif({
                        id: `member-${row.id}`,
                        message: `👤 Thêm thành viên mới: ${row.full_name}`,
                        type: 'member',
                        timestamp: new Date(),
                        read: false,
                    })
                }
            )
            .subscribe()

        channelRef.current = channel

        return () => {
            sb.removeChannel(channel)
        }
    }, [])

    function addRealtimeNotif(notif: RealtimeNotif) {
        setRealtimeNotifs(prev => {
            if (prev.some(n => n.id === notif.id)) return prev
            return [notif, ...prev].slice(0, 10) // keep max 10
        })
    }

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen) {
            // Mark all realtime as read
            setRealtimeNotifs(prev => prev.map(n => ({ ...n, read: true })))
            // Mark events as seen
            const seenIds = events.map(e => e.id)
            localStorage.setItem('seen_notifications', JSON.stringify(seenIds))
        }
    }

    const allNotifications = [
        ...realtimeNotifs.map(n => ({
            id: n.id,
            icon: n.type === 'board' ? <MessageSquare className="w-4 h-4 text-amber-500" />
                : n.type === 'member' ? <Users className="w-4 h-4 text-blue-500" />
                    : <Bell className="w-4 h-4 text-muted-foreground" />,
            title: n.message,
            subtitle: formatDistanceToNow(n.timestamp, { addSuffix: true, locale: vi }),
            unread: !n.read,
        })),
        ...events.map(e => {
            const seen: string[] = JSON.parse(localStorage.getItem('seen_notifications') || '[]')
            return {
                id: e.id,
                icon: <Calendar className="w-4 h-4 text-amber-500" />,
                title: e.title,
                subtitle: format(new Date(e.event_date), 'EEEE, dd/MM/yyyy', { locale: vi }),
                unread: !seen.includes(e.id),
            }
        }),
    ]

    return (
        <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-label="Thông báo"
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 hover:bg-white/10 text-white group"
                >
                    <Bell className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    {totalUnread > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 ring-2 ring-background text-[9px] font-bold text-white animate-pulse">
                            {totalUnread > 9 ? '9+' : totalUnread}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 glass border-border/50 shadow-2xl"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    {totalUnread > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-500 rounded-full">
                            {totalUnread} chưa đọc
                        </span>
                    )}
                </div>

                {/* Push Notif Banner */}
                {pushStatus === 'default' && (
                    <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 flex flex-col gap-1.5">
                        <p className="text-[11px] text-blue-500 leading-tight">Nhận thông báo ngay khi không mở trình duyệt</p>
                        <Button variant="outline" size="sm" className="h-6 text-[10px] text-blue-500 border-blue-500/30 hover:bg-blue-500/10" onClick={handleSubscribePush}>
                            Bật quyền thông báo
                        </Button>
                    </div>
                )}

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-border/30">
                    {allNotifications.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            <p>Không có thông báo nào.</p>
                        </div>
                    ) : (
                        allNotifications.map(n => (
                            <div
                                key={n.id}
                                className={cn(
                                    "flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-default",
                                    n.unread && "bg-amber-500/5"
                                )}
                            >
                                <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-background/50 border border-border/40 flex items-center justify-center">
                                    {n.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-snug">{n.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{n.subtitle}</p>
                                </div>
                                {n.unread && (
                                    <div className="shrink-0 mt-1 w-2 h-2 rounded-full bg-amber-500" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {events.length > 0 && (
                    <div className="p-2 border-t border-border/50 bg-black/20">
                        <Button
                            variant="ghost"
                            className="w-full text-xs h-8 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                            onClick={() => window.location.href = '/events'}
                        >
                            Xem lịch sự kiện →
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
