'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { CalendarDays, Plus, Loader2, MapPin, Clock, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Event = {
    id: string
    title: string
    description: string | null
    event_date: string
    event_time: string | null
    location: string | null
    type: string
    created_at: string
}

const EVENT_TYPES: Record<string, { label: string; emoji: string; color: string }> = {
    gio_to: { label: 'Giỗ Tổ', emoji: '🕯️', color: 'text-red-500 bg-red-500/10 border-red-500/30' },
    dam_cuoi: { label: 'Đám Cưới', emoji: '💒', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' },
    sinh_nhat: { label: 'Sinh Nhật', emoji: '🎂', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    tang_le: { label: 'Tang Lễ', emoji: '🪔', color: 'text-slate-400 bg-slate-400/10 border-slate-400/30' },
    hop_mat: { label: 'Họp Mặt', emoji: '🎉', color: 'text-green-500 bg-green-500/10 border-green-500/30' },
    khac: { label: 'Khác', emoji: '📌', color: 'text-muted-foreground bg-muted border-border' },
}

const EMPTY_FORM = { title: '', description: '', event_date: '', event_time: '', location: '', type: 'khac' }

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Event | null>(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const sb = createClient() as any

    const load = async () => {
        setLoading(true)
        const { data } = await sb.from('events').select('*').order('event_date', { ascending: true })
        setEvents(data ?? [])
        setLoading(false)
    }

    useEffect(() => { load() }, [])
    useEffect(() => {
        sb.auth.getUser().then(({ data }: any) => {
            if (!data.user) return
            sb.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }: any) => {
                setIsAdmin(p?.role === 'admin')
            })
        })
    }, [])

    const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true) }
    const openEdit = (e: Event) => {
        setEditTarget(e)
        setForm({ title: e.title, description: e.description ?? '', event_date: e.event_date, event_time: e.event_time ?? '', location: e.location ?? '', type: e.type })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.title || !form.event_date) { toast.error('Vui lòng nhập tên và ngày'); return }
        setSaving(true)
        try {
            if (editTarget) {
                await sb.from('events').update({ ...form, event_time: form.event_time || null, description: form.description || null, location: form.location || null, updated_at: new Date().toISOString() }).eq('id', editTarget.id)
                toast.success('Đã cập nhật sự kiện')
            } else {
                await sb.from('events').insert({ ...form, event_time: form.event_time || null, description: form.description || null, location: form.location || null })
                toast.success('Đã thêm sự kiện mới')
            }
            setDialogOpen(false)
            await load()
        } catch (e: any) { toast.error(e.message) }
        setSaving(false)
    }

    const handleDelete = async (e: Event) => {
        if (!confirm(`Xoá "${e.title}"?`)) return
        await sb.from('events').delete().eq('id', e.id)
        toast.success('Đã xoá')
        await load()
    }

    const now = new Date()
    const upcoming = events.filter(e => new Date(e.event_date) >= now)
    const past = events.filter(e => new Date(e.event_date) < now)

    const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const daysUntil = (d: string) => {
        const diff = Math.ceil((new Date(d).getTime() - now.getTime()) / 86400000)
        if (diff === 0) return 'Hôm nay'
        if (diff === 1) return 'Ngày mai'
        if (diff > 0) return `${diff} ngày nữa`
        return `${Math.abs(diff)} ngày trước`
    }

    const EventCard = ({ e }: { e: Event }) => {
        const meta = EVENT_TYPES[e.type] ?? EVENT_TYPES.khac
        const isPast = new Date(e.event_date) < now
        return (
            <div className={cn('glass rounded-xl p-4 border transition-all group', isPast ? 'opacity-60 border-border/40' : 'border-border/60 hover:border-amber-400/40')}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="text-2xl mt-0.5 shrink-0">{meta.emoji}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-sm">{e.title}</p>
                                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 border', meta.color)}>
                                    {meta.label}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(e.event_date)}</p>
                            {!isPast && (
                                <p className="text-xs font-medium text-amber-500 dark:text-amber-400 mt-0.5">{daysUntil(e.event_date)}</p>
                            )}
                            {e.event_time && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Clock className="w-3 h-3" /> {e.event_time}
                                </div>
                            )}
                            {e.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <MapPin className="w-3 h-3 shrink-0" /> {e.location}
                                </div>
                            )}
                            {e.description && <p className="text-xs text-muted-foreground mt-1 italic">{e.description}</p>}
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-amber-500" onClick={() => openEdit(e)}><Pencil className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500" onClick={() => handleDelete(e)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                    )}
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
                            <CalendarDays className="w-4 h-4 text-amber-900" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none">Sự Kiện</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">{upcoming.length} sự kiện sắp tới</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <Button size="sm" className="gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90 gap-1.5" onClick={openAdd}>
                            <Plus className="w-3.5 h-3.5" /> Thêm sự kiện
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {upcoming.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sắp tới ({upcoming.length})</p>
                                <div className="space-y-3">{upcoming.map(e => <EventCard key={e.id} e={e} />)}</div>
                            </div>
                        )}
                        {past.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Đã qua ({past.length})</p>
                                <div className="space-y-3">{past.map(e => <EventCard key={e.id} e={e} />)}</div>
                            </div>
                        )}
                        {events.length === 0 && (
                            <p className="text-center text-muted-foreground py-12">Chưa có sự kiện nào</p>
                        )}
                    </>
                )}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>{editTarget ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1"><Label>Tên sự kiện *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Giỗ Tổ Trần Tộc..." /></div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Ngày *</Label>
                                <Input type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                                <Label>Giờ</Label>
                                <Input type="time" value={form.event_time} onChange={e => setForm(f => ({ ...f, event_time: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Loại sự kiện</Label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1"><Label>Địa điểm</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Nhà thờ họ, địa chỉ..." /></div>
                        <div className="space-y-1"><Label>Mô tả</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Chi tiết sự kiện..." /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                        <Button className="gold-gradient border-0 text-amber-950" onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {editTarget ? 'Lưu' : 'Thêm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
