'use client'

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    ReactFlowProvider,
    useReactFlow,
    useNodesState,
    useEdgesState,
    type NodeMouseHandler,
    type Node,
    type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dynamic from 'next/dynamic'
import { PersonNode } from '@/components/tree/person-node'
import { buildTreeLayout, type PersonNode as PersonNodeType } from '@/lib/tree-layout'
import { getAllMembers, getAllSpouses } from '@/lib/supabase-data'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { Input } from '@/components/ui/input'

// Lazy load heavy chart components
const ReactFlow = dynamic(() => import('@xyflow/react').then(mod => mod.ReactFlow), { ssr: false })
const Controls = dynamic(() => import('@xyflow/react').then(mod => mod.Controls), { ssr: false })
const MiniMap = dynamic(() => import('@xyflow/react').then(mod => mod.MiniMap), { ssr: false })
const Background = dynamic(() => import('@xyflow/react').then(mod => mod.Background), { ssr: false })
const HorizontalMindmap = dynamic(() => import('@/components/tree/modes/horizontal-mindmap').then(mod => mod.HorizontalMindmap), { ssr: false })
const ListView = dynamic(() => import('@/components/tree/modes/list-view').then(mod => mod.ListView), { ssr: false })

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, X, Users, GitBranch, Share2, List, Network, Waypoints, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type ViewMode = 'vertical' | 'mindmap' | 'list'

const nodeTypes = { person: PersonNode }

function PersonDetailPanel({ member, spouses, onClose }: { member: Member; spouses: Spouse[]; onClose: () => void }) {
    const meta = (member.metadata as MemberMetadata) || {}
    const memberSpouses = spouses.filter(s => s.member_id === member.id)

    return (
        <div className="absolute right-4 top-4 z-[100] w-72 bg-card/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-border/80 animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-inner',
                            member.gender === 'male' ? 'bg-blue-500/10 border-blue-500/20' :
                                member.gender === 'female' ? 'bg-rose-400/10 border-rose-400/20' : 'bg-muted border-border'
                        )}>
                            {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'}
                        </div>
                        <div>
                            <div className="flex gap-1.5 mb-1.5">
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-background/50 border-amber-500/20 text-amber-600 font-black">Đời {member.generation_level}</Badge>
                                <Badge variant={meta.is_alive !== false ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5 font-bold">
                                    {meta.is_alive !== false ? 'Còn sống' : 'Đã mất'}
                                </Badge>
                            </div>
                            <h3 className="font-black text-xl leading-tight text-foreground tracking-tight">{member.full_name}</h3>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" aria-label="Đóng chi tiết" className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted" onClick={onClose}>
                        <X className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 shadow-sm">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Năm sinh</span>
                            <span className="font-bold text-sm tracking-tighter">{meta.birth_year || '---'}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 shadow-sm">
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest block mb-1">Năm mất</span>
                            <span className="font-bold text-sm text-rose-500 tracking-tighter">{meta.death_year || '---'}</span>
                        </div>
                    </div>

                    {memberSpouses.length > 0 && (
                        <div className="space-y-2.5">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-6 h-px bg-amber-500/30"></span> Phối ngẫu
                            </span>
                            <div className="grid gap-2">
                                {memberSpouses.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border/60 hover:border-rose-300/40 transition-colors shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-sm border border-rose-500/20">💍</div>
                                        <div>
                                            <p className="text-xs font-black text-foreground">{s.full_name}</p>
                                            {(s.metadata as MemberMetadata)?.birth_year && (
                                                <p className="text-[10px] text-muted-foreground font-medium">Sinh năm: {(s.metadata as MemberMetadata).birth_year}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {meta.notes && (
                        <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 relative">
                            <Waypoints className="absolute right-3 top-3 w-4 h-4 text-amber-500/10" />
                            <p className="text-[11px] leading-relaxed text-muted-foreground italic font-medium">"{meta.notes}"</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2.5 mt-6 pt-4 border-t border-border/40">
                    <Button
                        variant="outline"
                        className="flex-1 h-11 text-xs font-black rounded-xl border-amber-500/20 text-amber-600 hover:bg-amber-500/5 shadow-sm"
                        onClick={() => {
                            const url = `${window.location.origin}/tree?root=${member.id}`
                            navigator.clipboard.writeText(url)
                            toast.success('Đã sao chép liên kết nhánh!')
                        }}
                    >
                        <Share2 className="w-4 h-4 mr-2" /> Link
                    </Button>
                    <Button
                        className="flex-[2] h-11 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20"
                        onClick={() => window.location.href = `/tree?root=${member.id}`}
                    >
                        Xem phả hệ từ đây
                    </Button>
                </div>
            </div>
        </div>
    )
}

function TreeContent({ members, spouses, defaultRootId }: { members: Member[]; spouses: Spouse[], defaultRootId?: string | null }) {
    const { fitView, setCenter } = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [selected, setSelected] = useState<Member | null>(null)
    const [search, setSearch] = useState('')
    const searchParams = useSearchParams()
    const focusId = searchParams.get('focus')
    const urlRootId = searchParams.get('root')
    const [viewMode, setViewMode] = useState<ViewMode>('vertical')

    const activeRootId = useMemo(() => {
        if (urlRootId) return urlRootId
        if (defaultRootId) return defaultRootId
        if (!members.length) return null

        // Mặc định chọn người đời cao nhất (Thủy tổ)
        const oldest = [...members].sort((a, b) => a.generation_level - b.generation_level)[0]
        return oldest?.id || null
    }, [urlRootId, defaultRootId, members])

    const ancestryTrail = useMemo(() => {
        // Tầm nhìn: Trail sẽ hiển thị từ người đang được chọn (selected) ngược về Thủy tổ
        const targetId = selected?.id || activeRootId
        if (!targetId || !members.length) return []

        const trail: Member[] = []
        let currId: string | null = targetId
        let safety = 0

        while (currId && safety < 100) {
            const member = members.find(m => m.id === currId)
            if (member) {
                trail.unshift(member)
                currId = member.father_id
            } else {
                currId = null
            }
            safety++
        }
        return trail
    }, [members, activeRootId, selected])

    const displayMembers = useMemo(() => {
        if (!activeRootId) return members
        const childrenMap = new Map<string, string[]>()
        members.forEach(m => {
            if (m.father_id) {
                if (!childrenMap.has(m.father_id)) childrenMap.set(m.father_id, [])
                childrenMap.get(m.father_id)!.push(m.id)
            }
        })
        const result = new Set<string>()
        const queue = [activeRootId]
        while (queue.length > 0) {
            const curr = queue.shift()!
            if (result.has(curr)) continue
            result.add(curr)
            const children = childrenMap.get(curr) || []
            queue.push(...children)
        }
        return members.filter(m => result.has(m.id))
    }, [members, activeRootId])

    useEffect(() => {
        if (!focusId) return
        const m = displayMembers.find(x => x.id === focusId)
        if (m) setSelected(m)
    }, [focusId, displayMembers])

    const rawNodes = useRef<Node[]>([])
    useEffect(() => { rawNodes.current = nodes }, [nodes])

    useEffect(() => {
        const { nodes: n, edges: e } = buildTreeLayout(displayMembers, spouses)
        setNodes(n)
        setEdges(e)
        setTimeout(() => fitView({ padding: 0.15 }), 300)
    }, [displayMembers, spouses, setNodes, setEdges, fitView])

    const filtered = useMemo(() => {
        if (!search.trim()) return new Set<string>()
        const q = search.toLowerCase()
        return new Set(displayMembers.filter(m => m.full_name.toLowerCase().includes(q)).map(m => m.id))
    }, [search, displayMembers])

    useEffect(() => {
        setNodes(ns => ns.map(n => ({
            ...n,
            data: {
                ...n.data,
                isHighlighted: (filtered.size > 0 && filtered.has(n.id)) || n.id === focusId,
            },
        })))
        if (filtered.size === 1 || focusId) {
            const idToFocus = focusId || Array.from(filtered)[0]
            const node = rawNodes.current.find(n => n.id === idToFocus)
            if (node) {
                setTimeout(() => setCenter(node.position.x + 90, node.position.y + 40, { zoom: 1.2, duration: 600 }), 100)
            }
        }
    }, [search, focusId, setNodes, setCenter])

    const onNodeClick: NodeMouseHandler<Node> = useCallback((_evt, node) => {
        const m = displayMembers.find(x => x.id === node.id)
        setSelected(m ?? null)
    }, [displayMembers])

    const stats = useMemo(() => ({
        total: displayMembers.length,
        alive: displayMembers.filter(m => (m.metadata as MemberMetadata)?.is_alive !== false).length,
        gens: new Set(displayMembers.map(m => m.generation_level)).size,
    }), [displayMembers])

    return (
        <div className="flex flex-col w-full h-full bg-background overflow-hidden relative">
            {/* HEADER BRANDING & TOOLBAR HỢP NHẤT: Sticky top-0 để luôn cố định trên cùng */}
            <header className="sticky top-0 left-0 right-0 w-full bg-background border-b border-border z-[500] shadow-md shrink-0">
                <div className="p-3 sm:p-4 flex flex-col gap-4 max-w-7xl mx-auto">
                    {/* HÀNG 1: LOGO & TÌM KIẾM */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                                <span className="text-lg">🌳</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-black leading-none tracking-tight text-foreground uppercase">
                                    Gia Phả <span className="text-amber-500">Mỹ Nguyên</span>
                                </h1>
                            </div>

                            <div className="relative group shadow-sm rounded-xl ml-2 shrink-0 sm:shrink">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
                                <Input
                                    placeholder="Tìm người..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 h-9 w-32 sm:w-48 lg:w-64 bg-muted/30 border-border/60 focus-visible:ring-amber-500/20 rounded-xl font-bold text-xs"
                                />
                                {search && (
                                    <button aria-label="Xóa tìm kiếm" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 hover:bg-muted rounded-full" onClick={() => setSearch('')}>
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* VIEW SWITCHER & STATS */}
                        <div className="flex items-center gap-3 ml-auto">
                            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-muted/20 rounded-xl border border-border/30">
                                <span className="text-[10px] font-black text-foreground">
                                    {stats.total} viên <span className="text-muted-foreground">/</span> {stats.gens} đời
                                </span>
                            </div>

                            <div className="bg-muted/30 rounded-xl p-0.5 flex items-center shadow-inner border border-border/40 gap-0.5 backdrop-blur-sm">
                                {[
                                    { id: 'vertical', icon: Network, label: 'Sơ đồ' },
                                    { id: 'mindmap', icon: Waypoints, label: 'Mindmap' },
                                    { id: 'list', icon: List, label: 'Dsach' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        aria-label={tab.label}
                                        onClick={() => setViewMode(tab.id as ViewMode)}
                                        className={cn("px-2.5 py-1.5 rounded-lg text-[9px] font-black flex items-center gap-1.5 transition-all outline-none",
                                            viewMode === tab.id
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                    >
                                        <tab.icon className="w-3 h-3" /> <span className="hidden sm:inline lowercase first-letter:uppercase">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {(urlRootId || (defaultRootId && activeRootId !== defaultRootId)) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-[10px] font-black rounded-lg border-amber-500/30 text-amber-600 hover:bg-amber-500/5 shadow-sm"
                                    onClick={() => window.location.href = '/tree'}
                                >
                                    <Waypoints className="w-3 h-3 mr-1.5" /> Gốc
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* HÀNG 2: ANCESTRY TRAIL (BREADCRUMBS) */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-border/30 mt-1">
                        <span className="shrink-0 text-[9px] font-black uppercase text-amber-600 tracking-tighter">
                            Phả hệ ({ancestryTrail.length}):
                        </span>
                        <div className="flex items-center gap-1.5 min-w-max">
                            {ancestryTrail.length > 0 ? ancestryTrail.map((m, idx) => (
                                <div key={m.id} className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => window.location.href = `/tree?root=${m.id}`}
                                        className={cn(
                                            "text-[10px] px-3 py-1 rounded-full transition-all border font-bold shadow-sm whitespace-nowrap",
                                            m.id === (selected?.id || activeRootId)
                                                ? "bg-amber-500/10 border-amber-500/40 text-amber-600"
                                                : "bg-background border-border text-muted-foreground hover:border-amber-500/40 hover:text-amber-500"
                                        )}
                                    >
                                        {m.full_name}
                                    </button>
                                    {idx < ancestryTrail.length - 1 && (
                                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
                                    )}
                                </div>
                            )) : (
                                <div className="text-[10px] font-medium text-muted-foreground opacity-50 px-2 italic">Chọn người để lộ diện phả hệ...</div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENT AREA: Đảm bảo z-index thấp hơn header */}
            <main className="flex-1 relative overflow-hidden bg-dot-pattern bg-[length:32px_32px] pt-4 sm:pt-6 z-0">
                {selected && <div className="pointer-events-auto"><PersonDetailPanel member={selected} spouses={spouses} onClose={() => setSelected(null)} /></div>}

                <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-16 h-16 rounded-3xl gold-gradient shadow-2xl animate-spin-slow" />
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Đang vẽ phả hệ...</p>
                        </div>
                    </div>
                }>
                    {viewMode === 'vertical' && (
                        <div className="w-full h-full">
                            <ReactFlow
                                colorMode="dark"
                                className="bg-transparent"
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onNodeClick={onNodeClick}
                                onPaneClick={() => setSelected(null)}
                                nodeTypes={nodeTypes}
                                fitView
                                fitViewOptions={{ padding: 0.15 }}
                                minZoom={0.05}
                                maxZoom={3}
                                proOptions={{ hideAttribution: true }}
                            >
                                <Controls className="!bg-card !border-border shadow-2xl rounded-2xl overflow-hidden p-1 [&>button]:!bg-card hover:[&>button]:!bg-muted [&>button]:!border-none" />
                                <MiniMap
                                    nodeColor={(n: Node) => {
                                        const gender = (n.data as any)?.member?.gender
                                        return gender === 'male' ? '#3b82f6' : gender === 'female' ? '#fb7185' : '#78350f'
                                    }}
                                    className="!bg-card/90 !border-border rounded-2xl shadow-2xl overflow-hidden hidden sm:block"
                                    maskColor="rgba(0,0,0,0.1)"
                                />
                                <Background size={1.2} gap={32} color="#888" />
                            </ReactFlow>
                        </div>
                    )}

                    {viewMode === 'mindmap' && (
                        <div className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                            <HorizontalMindmap
                                members={displayMembers}
                                spouses={spouses}
                                rootId={activeRootId || null}
                                selectedId={selected?.id || null}
                                onSelect={setSelected}
                            />
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <ListView
                            members={displayMembers}
                            spouses={spouses}
                            selectedId={selected?.id || null}
                            onSelect={setSelected}
                        />
                    )}
                </Suspense>
            </main>
        </div>
    )
}

export default function TreeClient({ defaultRootId }: { defaultRootId?: string | null }) {
    const [members, setMembers] = useState<Member[]>([])
    const [spouses, setSpouses] = useState<Spouse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        Promise.all([getAllMembers(), getAllSpouses()])
            .then(([m, s]) => {
                if (isMounted) {
                    setMembers(m)
                    setSpouses(s)
                    setLoading(false)
                }
            })
            .catch(err => {
                console.error("Error loading tree data:", err)
                if (isMounted) setLoading(false)
            })
        return () => { isMounted = false }
    }, [])

    return (
        <div className="h-full flex flex-col bg-background selection:bg-amber-500/30 font-sans antialiased overflow-hidden">
            {/* 
                HEADER BRANDING BAR CŨ ĐÃ BỊ XÓA VÀ HỢP NHẤT VÀO TREECONTENT 
                ĐỂ TIẾT KIỆM KHÔNG GIAN VÀ TRÁNH CHỒNG LẤN
            */}
            <div className="flex-1 relative overflow-hidden">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background z-[120]">
                        <div className="text-center animate-in fade-in zoom-in duration-700">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-[2.5rem] gold-gradient mx-auto flex items-center justify-center text-5xl shadow-2xl animate-bounce">🌳</div>
                                <div className="absolute -inset-4 bg-amber-500/10 rounded-full animate-ping blur-xl" />
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-1.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                    ))}
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-[0.4em] text-foreground">Khởi tạo dữ liệu</h2>
                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Vui lòng đợi trong giây lát</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <ReactFlowProvider>
                        <TreeContent members={members} spouses={spouses} defaultRootId={defaultRootId} />
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    )
}
