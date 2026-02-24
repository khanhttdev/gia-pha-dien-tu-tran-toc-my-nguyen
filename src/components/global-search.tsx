'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command'
import { Search, Loader2, Users, CalendarDays, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<{ people: any[], events: any[], media: any[] }>({
        people: [], events: [], media: []
    })
    const router = useRouter()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen(open => !open)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    useEffect(() => {
        if (!query.trim()) {
            setResults({ people: [], events: [], media: [] })
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            const sb = createClient()
            const q = `%${query}%`

            const [p, e, m] = await Promise.all([
                sb.from('people').select('id, full_name, birth_year').ilike('full_name', q).limit(5),
                sb.from('events').select('id, title, date').ilike('title', q).limit(5),
                sb.from('media').select('id, title, type').ilike('title', q).limit(5)
            ])

            setResults({
                people: p.data || [],
                events: e.data || [],
                media: m.data || []
            })
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full flex justify-between items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="font-medium text-amber-100/70">Tìm kiếm...</span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 font-mono text-[10px] font-medium text-amber-200/50 bg-black/20 border border-white/10 rounded">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Tìm người, sự kiện, ảnh..." value={query} onValueChange={setQuery} />
                <CommandList>
                    <CommandEmpty>
                        {loading ? <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : 'Không tìm thấy kết quả.'}
                    </CommandEmpty>

                    {results.people.length > 0 && (
                        <CommandGroup heading="Thành viên">
                            {results.people.map(p => (
                                <CommandItem key={p.id} value={p.full_name} onSelect={() => runCommand(() => router.push(`/tree?focus=${p.id}`))}>
                                    <Users className="w-4 h-4 mr-2 text-amber-500" />
                                    <span>{p.full_name}</span>
                                    {p.birth_year && <span className="ml-2 text-xs text-muted-foreground">({p.birth_year})</span>}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.events.length > 0 && (
                        <CommandGroup heading="Sự kiện">
                            {results.events.map(e => (
                                <CommandItem key={e.id} value={e.title} onSelect={() => runCommand(() => router.push(`/events`))}>
                                    <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
                                    <span>{e.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {results.media.length > 0 && (
                        <CommandGroup heading="Thư viện">
                            {results.media.map(m => (
                                <CommandItem key={m.id} value={m.title} onSelect={() => runCommand(() => router.push(`/media`))}>
                                    <ImageIcon className="w-4 h-4 mr-2 text-emerald-500" />
                                    <span>{m.title}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
