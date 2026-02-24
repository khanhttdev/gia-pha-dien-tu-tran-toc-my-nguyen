'use client'

import { useEffect, useState } from 'react'
import { getAllPeople } from '@/lib/supabase-data'
import { Person } from '@/lib/types'
import { createClient } from '@/lib/supabase-client'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Phone, Search, Pencil, Loader2, MessageCircle, Mail, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Contact } from '@/lib/types'

type PersonWithContact = Person & { contact?: Contact }

export default function DirectoryPage() {
    const [people, setPeople] = useState<PersonWithContact[]>([])
    const [filtered, setFiltered] = useState<PersonWithContact[]>([])
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [editPerson, setEditPerson] = useState<PersonWithContact | null>(null)
    const [form, setForm] = useState({ phone: '', zalo: '', facebook: '', email: '', address: '', notes: '' })
    const [saving, setSaving] = useState(false)
    const sb = createClient()

    const load = async () => {
        setLoading(true)
        const allPeople = await getAllPeople()
        const { data: contacts } = await sb.from('contacts').select('*')
        const contactMap = new Map((contacts ?? []).map((c: Contact) => [c.person_id, c]))
        const merged = allPeople.map(p => ({ ...p, contact: contactMap.get(p.id) as Contact | undefined }))
        setPeople(merged)
        setFiltered(merged)
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

    useEffect(() => {
        if (!query.trim()) { setFiltered(people); return }
        const q = query.toLowerCase()
        setFiltered(people.filter(p => p.full_name.toLowerCase().includes(q) || p.contact?.phone?.includes(q) || p.contact?.email?.toLowerCase().includes(q)))
    }, [query, people])

    const openEdit = (p: PersonWithContact) => {
        setEditPerson(p)
        setForm({
            phone: p.contact?.phone ?? '',
            zalo: p.contact?.zalo ?? '',
            facebook: p.contact?.facebook ?? '',
            email: p.contact?.email ?? '',
            address: p.contact?.address ?? '',
            notes: p.contact?.notes ?? '',
        })
    }

    const handleSave = async () => {
        if (!editPerson) return
        setSaving(true)
        try {
            const existing = editPerson.contact
            if (existing) {
                await sb.from('contacts').update({ ...form, updated_at: new Date().toISOString() }).eq('id', existing.id)
            } else {
                await sb.from('contacts').insert({ ...form, person_id: editPerson.id })
            }
            toast.success('Đã lưu thông tin liên lạc')
            setEditPerson(null)
            await load()
        } catch (e: any) {
            toast.error(e.message)
        }
        setSaving(false)
    }

    const withContact = filtered.filter(p => p.contact)
    const withoutContact = filtered.filter(p => !p.contact)

    const ContactCard = ({ p }: { p: PersonWithContact }) => (
        <div className={cn(
            'glass rounded-xl p-4 border border-border/60 hover:border-amber-400/40 transition-all group',
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
                        <p className="text-xs text-muted-foreground">Thế hệ {p.generation}</p>
                    </div>
                </div>
                {isAdmin && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-amber-500 shrink-0"
                        onClick={() => openEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            {p.contact ? (
                <div className="mt-3 space-y-1.5">
                    {p.contact.phone && (
                        <a href={`tel:${p.contact.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <Phone className="w-3 h-3" /> {p.contact.phone}
                        </a>
                    )}
                    {p.contact.zalo && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MessageCircle className="w-3 h-3 text-blue-400" />
                            <span>Zalo: {p.contact.zalo}</span>
                        </div>
                    )}
                    {p.contact.email && (
                        <a href={`mailto:${p.contact.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="w-3 h-3" /> {p.contact.email}
                        </a>
                    )}
                    {p.contact.address && (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {p.contact.address}
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground italic">Chưa có thông tin liên lạc</p>
                    {isAdmin && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-amber-500 hover:text-amber-400 px-2" onClick={() => openEdit(p)}>
                            + Thêm
                        </Button>
                    )}
                </div>
            )}
        </div>
    )

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-border glass">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                        <Phone className="w-4 h-4 text-amber-900" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-none">Danh Bạ</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">{withContact.length}/{people.length} thành viên có thông tin</p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input placeholder="Tìm theo tên, số điện thoại, email..." value={query} onChange={e => setQuery(e.target.value)} className="pl-9 h-8 text-sm" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                    <div className="space-y-6">
                        {withContact.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Có thông tin liên lạc ({withContact.length})</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {withContact.map(p => <ContactCard key={p.id} p={p} />)}
                                </div>
                            </div>
                        )}
                        {isAdmin && withoutContact.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Chưa có thông tin ({withoutContact.length})</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {withoutContact.map(p => <ContactCard key={p.id} p={p} />)}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={!!editPerson} onOpenChange={v => !v && setEditPerson(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Thông tin liên lạc — {editPerson?.full_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {[
                            { key: 'phone', label: 'Số điện thoại', placeholder: '09xxxxxxxx' },
                            { key: 'zalo', label: 'Zalo', placeholder: 'Số Zalo hoặc username' },
                            { key: 'facebook', label: 'Facebook', placeholder: 'Link profile Facebook' },
                            { key: 'email', label: 'Email', placeholder: 'email@example.com' },
                            { key: 'address', label: 'Địa chỉ', placeholder: 'Địa chỉ thường trú' },
                            { key: 'notes', label: 'Ghi chú', placeholder: 'Thông tin khác...' },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-1">
                                <Label>{label}</Label>
                                <Input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditPerson(null)}>Hủy</Button>
                        <Button className="gold-gradient border-0 text-amber-950" onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Lưu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
