'use client'

import { useEffect, useState, useMemo } from 'react'
import { getAllMembers, getAllSpouses } from '@/lib/supabase-data'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { BookOpen, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type FamilyBranch = {
    member: Member
    children: FamilyBranch[]
    spouses: Spouse[]
}

function buildFamilyTree(members: Member[], spouses: Spouse[]): FamilyBranch[] {
    const map = new Map<string, Member>(members.map(m => [m.id, m]))
    const spouseByMember = new Map<string, Spouse[]>()
    spouses.forEach(s => {
        if (!spouseByMember.has(s.member_id)) spouseByMember.set(s.member_id, [])
        spouseByMember.get(s.member_id)!.push(s)
    })

    const childrenOf = new Map<string, Member[]>()
    members.forEach(m => {
        if (m.father_id && map.has(m.father_id)) {
            if (!childrenOf.has(m.father_id)) childrenOf.set(m.father_id, [])
            childrenOf.get(m.father_id)!.push(m)
        }
    })

    const hasParent = new Set(members.filter(m => m.father_id && map.has(m.father_id)).map(m => m.id))
    const roots = members.filter(m => !hasParent.has(m.id) && m.gender === 'male')

    const buildBranch = (m: Member): FamilyBranch => ({
        member: m,
        children: (childrenOf.get(m.id) ?? []).sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0)).map(buildBranch),
        spouses: spouseByMember.get(m.id) ?? [],
    })

    return roots.map(buildBranch)
}

function BranchSection({ branch, depth = 0 }: { branch: FamilyBranch; depth?: number }) {
    const [open, setOpen] = useState(depth < 2)
    const { member, spouses, children } = branch
    const meta = (member.metadata as MemberMetadata) || {}
    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join('–')

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
                        <span className={cn('font-bold', depth === 0 ? 'text-base text-amber-600' : depth === 1 ? 'text-sm text-amber-700/80' : 'text-sm text-foreground/90')}>
                            {member.full_name}
                        </span>
                        {yearRange && <span className="text-xs text-muted-foreground">({yearRange})</span>}
                        {meta.is_alive === false && <span className="text-xs text-muted-foreground/60 italic">✝</span>}
                    </div>
                    {spouses.map(s => {
                        const sMeta = (s.metadata as MemberMetadata) || {}
                        return (
                            <p key={s.id} className="text-xs text-muted-foreground mt-0.5">
                                ♥ <span className="font-medium">{s.full_name}</span>
                                {sMeta.birth_year && <span className="ml-1">({[sMeta.birth_year, sMeta.death_year].filter(Boolean).join('–')})</span>}
                            </p>
                        )
                    })}
                    {meta.notes && depth === 0 && (
                        <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">{meta.notes}</p>
                    )}
                </div>
                <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                    'border',
                    member.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-rose-400/10 border-rose-400/30 text-rose-400'
                )}>
                    {member.generation_level}
                </div>
            </div>

            {/* Children */}
            {open && children.length > 0 && (
                <div className="pl-4 space-y-0">
                    {children.map(child => (
                        <BranchSection key={child.member.id} branch={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function BookPage() {
    const [members, setMembers] = useState<Member[]>([])
    const [spouses, setSpouses] = useState<Spouse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getAllMembers(), getAllSpouses()])
            .then(([m, s]) => { setMembers(m); setSpouses(s); setLoading(false) })
    }, [])

    const roots = useMemo(() => buildFamilyTree(members, spouses), [members, spouses])

    const stats = useMemo(() => ({
        total: members.length,
        alive: members.filter(m => (m.metadata as MemberMetadata)?.is_alive !== false).length,
        gens: new Set(members.map(m => m.generation_level)).size,
    }), [members])

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
                                <BranchSection key={branch.member.id} branch={branch} depth={0} />
                            ))}
                        </div>

                        {/* All members by generation */}
                        <div className="mt-10 pt-6 border-t border-border">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Danh Sách Theo Thế Hệ</h3>
                            {Array.from(new Set(members.map(m => m.generation_level))).sort().map(gen => {
                                const genMembers = members.filter(m => m.generation_level === gen)
                                return (
                                    <div key={gen} className="glass rounded-xl p-4 border border-border/60">
                                        <p className="text-sm font-semibold text-amber-700 mb-1">Thế hệ thứ {gen}</p>
                                        <p className="text-xs text-muted-foreground">{genMembers.length} thành viên ({genMembers.filter(m => (m.metadata as MemberMetadata)?.is_alive === false).length} đã mất)</p>
                                        <div className="space-y-1 mt-2">
                                            {genMembers.map(m => {
                                                const mMeta = (m.metadata as MemberMetadata) || {}
                                                return (
                                                    <div key={m.id} className="flex items-center gap-2 text-sm text-foreground/80 pl-3">
                                                        <span>{m.gender === 'male' ? '♂' : m.gender === 'female' ? '♀' : '—'}</span>
                                                        <span className="font-medium">{m.full_name}</span>
                                                        {(mMeta.birth_year || mMeta.death_year) && (
                                                            <span className="text-xs text-muted-foreground">
                                                                ({[mMeta.birth_year, mMeta.death_year].filter(Boolean).join('–')})
                                                            </span>
                                                        )}
                                                        {mMeta.is_alive === false && <span className="text-xs text-muted-foreground">✝</span>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
