'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { vi } from 'date-fns/locale'

type AppEvent = {
    id: string
    title: string
    event_date: string
    type: string | null
}

export function NotificationMenu() {
    const [events, setEvents] = useState<AppEvent[]>([])
    const [unread, setUnread] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
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

            if (data) {
                setEvents(data)
                // We'll just mark them all as "unread" for demo purposes 
                // Alternatively, could use localStorage to track seen event IDs
                const seenState = localStorage.getItem('seen_notifications')
                const seenIds: string[] = seenState ? JSON.parse(seenState) : []
                const unreadCount = data.filter(e => !seenIds.includes(e.id)).length
                setUnread(unreadCount)
            }
        }

        fetchUpcomingEvents()
    }, [])

    const handleOpen = (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && unread > 0) {
            setUnread(0)
            const seenIds = events.map(e => e.id)
            localStorage.setItem('seen_notifications', JSON.stringify(seenIds))
        }
    }

    return (
        <Popover open={open} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button aria-label="Action Button" variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-white/10 text-white group">
                    <Bell className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    {unread > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 glass border-border/50 shadow-2xl" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-500 rounded-full">
                        {events.length} Mới
                    </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {events.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            <p>Không có sự kiện nào sắp diễn ra.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {events.map((e) => {
                                const eventDate = new Date(e.event_date)
                                const isSoon = isBefore(eventDate, addDays(new Date(), 3))

                                return (
                                    <div key={e.id} className="flex gap-3 px-4 py-3 border-b border-border/30 hover:bg-white/5 transition-colors cursor-default">
                                        <div className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                                            <span className="text-xl">📅</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium leading-tight mb-1">{e.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(eventDate, "EEEE, dd/MM/yyyy", { locale: vi })}
                                            </p>
                                            {isSoon && (
                                                <p className="text-[10px] text-red-400 font-medium mt-1">Sắp diễn ra!</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
                {events.length > 0 && (
                    <div className="p-2 border-t border-border/50 bg-black/20">
                        <Button variant="ghost" className="w-full text-xs h-8 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => window.location.href = '/events'}>
                            Xem lịch sự kiện
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
