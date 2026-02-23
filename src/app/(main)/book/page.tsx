'use client'

import { useEffect, useState, useMemo } from 'react'
import { getAllPeople } from '@/lib/supabase-data'
import { Person } from '@/lib/types'
import { BookOpen, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FamilyBranch = {
    person: Person
    children: FamilyBranch[]
    spouse?: Person
}

function buildFamilyTree(people: Person[]): FamilyBranch[] {
    const map = new Map<string, Person>(people.map(p => [p.id, p]))
    const childrenOf = new Map<string, Person[]>()

    people.forEach(p => {
        const parentId = p.father_id ?? p.mother_id
        if (parentId && map.has(parentId)) {
            if (!childrenOf.has(parentId)) childrenOf.set(parentId, [])
            childrenOf.get(parentId)!.push(p)
        }
    })

    const hasParent = new Set(people.filter(p => (p.father_id && map.has(p.father_id)) || (p.mother_id && map.has(p.mother_id))).map(p => p.id))
    const roots = people.filter(p => !hasParent.has(p.id) && p.gender === 'male')

    const buildBranch = (p: Person): FamilyBranch => ({
        person: p,
        children: (childrenOf.get(p.id) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(buildBranch),
        spouse: p.gender === 'male' ? people.find(x => x.id !== p.id && x.gender === 'female' && (
            (childrenOf.get(p.id) ?? []).some(c => c.mother_id === x.id)
        )) : undefined,
    })

    return roots.map(buildBranch)
}

function BranchSection({ branch, depth = 0 }: { branch: FamilyBranch; depth?: number }) {
    const [open, setOpen] = useState(depth < 2)
    const { person, spouse, children } = branch
    const yearRange = [person.birth_year, person.death_year].filter(Boolean).join('–')

    return (
        <div className={cn('border-l-2 pl-4 mb-4', depth === 0 ? 'border-amber-500' : depth === 1 ? 'border-amber-400/50' : 'border-border')}>
            {/* Person header */}
            <div className="flex items-start gap-3 mb-2">
                <button
                    className="mt-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(!open)}
                >
                    {children.length > 0
                        ? open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        : <span className="w-4 h-4 block" />
                    }
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('font-bold', depth === 0 ? 'text-base text-amber-600 dark:text-amber-400' : depth === 1 ? 'text-sm' : 'text-sm text-foreground/90')}>
                            {person.full_name}
                        </span>
                        {yearRange && <span className="text-xs text-muted-foreground">({yearRange})</span>}
                        {!person.is_alive && <span className="text-xs text-muted-foreground/60 italic">✝</span>}
                    </div>
                    {spouse && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            ♥ <span className="font-medium">{spouse.full_name}</span>
                            {spouse.birth_year && <span className="ml-1">({[spouse.birth_year, spouse.death_year].filter(Boolean).join('–')})</span>}
                        </p>
                    )}
                    {person.notes && depth === 0 && (
                        <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">{person.notes}</p>
                    )}
                </div>
                <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                    'border',
                    person.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-rose-400/10 border-rose-400/30 text-rose-400'
                )}>
                    {person.generation}
                </div>
            </div>

            {/* Children */}
            {open && children.length > 0 && (
                <div className="pl-4 space-y-0">
                    {children.map(child => (
                        <BranchSection key={child.person.id} branch={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function BookPage() {
    const [people, setPeople] = useState<Person[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllPeople().then(data => { setPeople(data); setLoading(false) })
    }, [])

    const roots = useMemo(() => building(people), [people])
    function building(p: Person[]) { return buildFamilyTree(p) }

    const stats = useMemo(() => ({
        total: people.length,
        alive: people.filter(p => p.is_alive).length,
        gens: new Set(people.map(p => p.generation)).size,
        males: people.filter(p => p.gender === 'male').length,
        females: people.filter(p => p.gender === 'female').length,
    }), [people])

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-border glass">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-amber-900" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-none">Sách Gia Phả</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Trần Tộc Mỹ Nguyên — tự động tạo từ dữ liệu</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center mb-10 p-8 glass rounded-2xl border border-border/60">
                            <div className="text-5xl mb-4">📖</div>
                            <h2 className="text-2xl font-bold gold-text mb-2">GIA PHẢ TRẦN TỘC MỸ NGUYÊN</h2>
                            <p className="text-sm text-muted-foreground">Lưu giữ và truyền thừa qua các thế hệ</p>
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">{stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Thành viên</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">{stats.gens}</div>
                                    <div className="text-xs text-muted-foreground">Thế hệ</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">{stats.alive}</div>
                                    <div className="text-xs text-muted-foreground">Còn sống</div>
                                </div>
                            </div>
                        </div>

                        {/* Family tree book format */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Phả Hệ</h3>
                            {roots.map(branch => (
                                <BranchSection key={branch.person.id} branch={branch} depth={0} />
                            ))}
                        </div>

                        {/* All members by generation */}
                        <div className="mt-10 pt-6 border-t border-border">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Danh Sách Theo Thế Hệ</h3>
                            {Array.from(new Set(people.map(p => p.generation))).sort().map(gen => (
                                <div key={gen} className="mb-4">
                                    <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Thế hệ thứ {gen}</p>
                                    <div className="space-y-1">
                                        {people.filter(p => p.generation === gen).map(p => (
                                            <div key={p.id} className="flex items-center gap-2 text-sm text-foreground/80 pl-3">
                                                <span>{p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : '—'}</span>
                                                <span className="font-medium">{p.full_name}</span>
                                                {(p.birth_year || p.death_year) && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({[p.birth_year, p.death_year].filter(Boolean).join('–')})
                                                    </span>
                                                )}
                                                {!p.is_alive && <span className="text-xs text-muted-foreground">✝</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
