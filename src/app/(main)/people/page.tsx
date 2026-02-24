'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAllPeople, createPerson, updatePerson, deletePerson, searchPeople } from '@/lib/supabase-data'
import { Person, PersonInsert } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/image-upload'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase-client'

type FormData = {
    full_name: string
    gender: 'male' | 'female' | 'unknown'
    birth_year: string
    death_year: string
    is_alive: boolean
    generation: string
    notes: string
    father_id: string
    mother_id: string
    avatar_url: string | null
}

const EMPTY_FORM: FormData = {
    full_name: '', gender: 'unknown', birth_year: '', death_year: '',
    is_alive: true, generation: '1', notes: '', father_id: '', mother_id: '', avatar_url: null
}

export default function PeoplePage() {
    const [people, setPeople] = useState<Person[]>([])
    const [filtered, setFiltered] = useState<Person[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<Person | null>(null)
    const [form, setForm] = useState<FormData>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        const data = await getAllPeople()
        setPeople(data)
        setFiltered(data)
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    useEffect(() => {
        const sb = createClient()
        sb.auth.getUser().then(({ data }) => {
            if (!data.user) return
            sb.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => {
                setIsAdmin((p as any)?.role === 'admin')
            })
        })
    }, [])

    useEffect(() => {
        if (!query.trim()) { setFiltered(people); return }
        const q = query.toLowerCase()
        setFiltered(people.filter(p => p.full_name.toLowerCase().includes(q)))
    }, [query, people])

    const openAdd = () => { setEditTarget(null); setForm(EMPTY_FORM); setDialogOpen(true) }
    const openEdit = (p: Person) => {
        setEditTarget(p)
        setForm({
            full_name: p.full_name, gender: (p.gender as any) || 'unknown', birth_year: String(p.birth_year ?? ''),
            death_year: String(p.death_year ?? ''), is_alive: p.is_alive ?? true,
            generation: String(p.generation), notes: p.notes ?? '',
            father_id: p.father_id ?? '', mother_id: p.mother_id ?? '',
            avatar_url: p.avatar_url,
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.full_name.trim()) { toast.error('Vui lòng nhập tên'); return }
        setSaving(true)
        const payload: PersonInsert = {
            full_name: form.full_name.trim(),
            gender: form.gender,
            birth_year: form.birth_year ? parseInt(form.birth_year) : null,
            death_year: form.death_year ? parseInt(form.death_year) : null,
            is_alive: form.is_alive,
            generation: parseInt(form.generation) || 1,
            notes: form.notes.trim() || null,
            father_id: form.father_id || null,
            mother_id: form.mother_id || null,
            avatar_url: form.avatar_url, sort_order: 0,
        }
        try {
            if (editTarget) {
                await updatePerson(editTarget.id, payload)
                toast.success('Đã cập nhật thông tin')
            } else {
                await createPerson(payload)
                toast.success('Đã thêm thành viên mới')
            }
            setDialogOpen(false)
            await load()
        } catch (e: any) {
            toast.error(e.message || 'Có lỗi xảy ra')
        }
        setSaving(false)
    }

    const handleDelete = async (p: Person) => {
        if (!confirm(`Xoá "${p.full_name}"? Hành động này không thể hoàn tác.`)) return
        try {
            await deletePerson(p.id)
            toast.success('Đã xoá thành viên')
            await load()
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const genderLabel = (g: string) => g === 'male' ? '♂ Nam' : g === 'female' ? '♀ Nữ' : '— Khác'
    const genderClass = (g: string) => g === 'male' ? 'text-blue-500' : g === 'female' ? 'text-rose-400' : 'text-muted-foreground'

    const byGen = filtered.reduce<Record<number, Person[]>>((acc, p) => {
        const g = p.generation ?? 1;
        (acc[g] = acc[g] || []).push(p)
        return acc
    }, {})

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b border-border glass">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                            <Users className="w-4 h-4 text-amber-900" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none">Thành Viên</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">{people.length} người trong dòng họ</p>
                        </div>
                    </div>
                    {isAdmin && (
                        <Button size="sm" className="gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90 gap-1.5" onClick={openAdd}>
                            <Plus className="w-3.5 h-3.5" /> Thêm thành viên
                        </Button>
                    )}
                </div>
                {/* Search */}
                <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm theo tên..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-8 text-sm" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : Object.keys(byGen).length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">Không tìm thấy thành viên nào</p>
                ) : (
                    Object.entries(byGen).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([gen, members]) => (
                        <div key={gen}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs font-semibold text-muted-foreground px-2">Thế hệ {gen}</span>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {members.map(p => (
                                    <div key={p.id} className={cn(
                                        'glass rounded-xl p-4 border border-border/60 hover:border-amber-400/40 transition-all duration-200 group',
                                        !p.is_alive && 'opacity-60'
                                    )}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={cn(
                                                    'w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 border',
                                                    p.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30' :
                                                        p.gender === 'female' ? 'bg-rose-400/10 border-rose-400/30' : 'bg-muted border-border'
                                                )}>
                                                    {p.gender === 'male' ? '👨' : p.gender === 'female' ? '👩' : '👤'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{p.full_name}</p>
                                                    <p className={cn('text-xs', genderClass(p.gender || 'unknown'))}>{genderLabel(p.gender || 'unknown')}</p>
                                                    {(p.birth_year || p.death_year) && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {[p.birth_year, p.death_year].filter(Boolean).join(' – ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button aria-label="Action Button" variant="ghost" size="icon" className="h-7 w-7 hover:text-amber-500" onClick={() => openEdit(p)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button aria-label="Action Button" variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500" onClick={() => handleDelete(p)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                        {!p.is_alive && <Badge variant="secondary" className="mt-2 text-[10px]">Đã mất</Badge>}
                                        {p.notes && <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2">{p.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1">
                            <Label>Họ và tên *</Label>
                            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Trần Văn A" />
                        </div>
                        <div className="space-y-1">
                            <Label>Ảnh đại diện (Avatar)</Label>
                            <ImageUpload
                                bucket="avatars"
                                value={form.avatar_url}
                                onChange={url => setForm(f => ({ ...f, avatar_url: url }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Giới tính</Label>
                                <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value as any }))}
                                    className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="unknown">Khác</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>Thế hệ</Label>
                                <Input type="number" min="1" value={form.generation} onChange={e => setForm(f => ({ ...f, generation: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>Năm sinh</Label>
                                <Input type="number" placeholder="1950" value={form.birth_year} onChange={e => setForm(f => ({ ...f, birth_year: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                                <Label>Năm mất</Label>
                                <Input type="number" placeholder="2020" value={form.death_year} onChange={e => setForm(f => ({ ...f, death_year: e.target.value, is_alive: !e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="alive" checked={form.is_alive} onChange={e => setForm(f => ({ ...f, is_alive: e.target.checked, death_year: e.target.checked ? '' : f.death_year }))} className="rounded" />
                            <Label htmlFor="alive" className="cursor-pointer">Còn sống</Label>
                        </div>
                        <div className="space-y-1">
                            <Label>Ghi chú</Label>
                            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Thông tin thêm..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Hủy</Button>
                        <Button className="gold-gradient border-0 text-amber-950" onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {editTarget ? 'Lưu thay đổi' : 'Thêm mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
