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
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { DetailPanel } from '@/components/tree/detail-panel'

// Lazy load heavy chart components
const ReactFlow = dynamic(() => import('@xyflow/react').then(mod => mod.ReactFlow), { ssr: false })
const Controls = dynamic(() => import('@xyflow/react').then(mod => mod.Controls), { ssr: false })
const MiniMap = dynamic(() => import('@xyflow/react').then(mod => mod.MiniMap), { ssr: false })
const Background = dynamic(() => import('@xyflow/react').then(mod => mod.Background), { ssr: false })

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, X, Users, Waypoints, ChevronRight, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

const nodeTypes = { person: PersonNode }

function TreeContent({ members, spouses, defaultRootId }: { members: Member[]; spouses: Spouse[], defaultRootId?: string | null }) {
    const { fitView, setCenter } = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [selected, setSelected] = useState<Member | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [search, setSearch] = useState('')

    const searchParams = useSearchParams()
    const focusId = searchParams.get('focus')
    const urlRootId = searchParams.get('root')

    const activeRootId = useMemo(() => {
        if (urlRootId) return urlRootId
        if (defaultRootId) return defaultRootId
        if (!members.length) return null
        const oldest = [...members].sort((a, b) => a.generation_level - b.generation_level)[0]
        return oldest?.id || null
    }, [urlRootId, defaultRootId, members])

    const ancestryTrail = useMemo(() => {
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
        if (m) {
            setSelected(m)
            setIsPanelOpen(true)
        }
    }, [displayMembers])

    const stats = useMemo(() => ({
        total: displayMembers.length,
        alive: displayMembers.filter(m => (m.metadata as MemberMetadata)?.is_alive !== false).length,
        gens: new Set(displayMembers.map(m => m.generation_level)).size,
    }), [displayMembers])

    return (
        <div className="flex flex-col w-full h-full bg-background overflow-hidden relative">
            <header className="sticky top-0 left-0 right-0 w-full bg-[#18181A] text-white border-b border-white/10 z-[500] shadow-md shrink-0">
                <div className="p-3 sm:p-4 flex flex-col gap-4 max-w-7xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shrink-0">
                                <span className="text-lg">🌳</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-sm font-black leading-none tracking-tight text-white uppercase">
                                    Gia Phả <span className="text-amber-500">Mỹ Nguyên</span>
                                </h1>
                            </div>

                            <div className="relative group shadow-sm rounded-xl ml-2 shrink-0 sm:shrink">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50 group-focus-within:text-amber-500 transition-colors" />
                                <Input
                                    placeholder="Tìm người..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9 h-9 w-32 sm:w-48 lg:w-64 bg-white/5 border-white/10 focus-visible:ring-amber-500/20 rounded-xl font-bold text-xs text-white placeholder:text-white/30"
                                />
                                {search && (
                                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-0.5 rounded-full" onClick={() => setSearch('')}>
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto">
                            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-[10px] font-black text-white/90">
                                    {stats.total} thành viên <span className="text-white/30">/</span> {stats.gens} đời
                                </span>
                            </div>

                            {(urlRootId || (defaultRootId && activeRootId !== defaultRootId)) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 text-[10px] font-black rounded-lg border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400 bg-transparent"
                                    onClick={() => window.location.href = '/tree'}
                                >
                                    <Waypoints className="w-3 h-3 mr-1.5" /> Thủy tổ
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-white/10 mt-1">
                        <span className="shrink-0 text-[10px] font-bold uppercase text-amber-500 tracking-tighter">
                            Phả hệ ({ancestryTrail.length}):
                        </span>
                        <div className="flex items-center gap-1.5 min-w-max">
                            {ancestryTrail.length > 0 ? ancestryTrail.map((m, idx) => (
                                <div key={m.id} className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => window.location.href = `/tree?root=${m.id}`}
                                        className={cn(
                                            "text-[11px] px-3 py-1 rounded-full transition-all border font-semibold shadow-sm whitespace-nowrap",
                                            m.id === (selected?.id || activeRootId)
                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                : "bg-white/5 border-white/10 text-white/70 hover:border-amber-500/40 hover:text-amber-400"
                                        )}
                                    >
                                        {m.full_name}
                                    </button>
                                    {idx < ancestryTrail.length - 1 && (
                                        <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                                    )}
                                </div>
                            )) : (
                                <div className="text-[10px] font-medium text-white/40 italic">Chọn người để lộ diện phả hệ...</div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 relative overflow-hidden bg-dot-pattern bg-[length:32px_32px] pt-4 sm:pt-6 z-0">
                <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><p className="text-white opacity-50 text-sm">Đang tải biểu đồ...</p></div>}>
                    <ReactFlow
                        colorMode="light" // Force light component rendering inside dark mode map
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
                        <Controls className="!bg-white !border-gray-200 shadow-xl rounded-xl overflow-hidden p-1 [&>button]:!bg-white hover:[&>button]:!bg-gray-50 [&>button]:!border-none [&>button]:!fill-slate-700" />
                        <MiniMap
                            nodeColor={(n: Node) => {
                                const m = (n.data as any)?.member
                                return m?.gender === 'male' ? '#60a5fa' : m?.gender === 'female' ? '#f472b6' : '#cbd5e1'
                            }}
                            className="!bg-white/90 !border-gray-200 rounded-xl shadow-xl overflow-hidden hidden sm:block"
                            maskColor="rgba(255,255,255,0.7)"
                        />
                    </ReactFlow>
                </Suspense>
            </main>

            <DetailPanel
                member={selected}
                spouses={spouses.filter(s => s.member_id === selected?.id)}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />
        </div>
    )
}

export default function TreeClient({ defaultRootId, initialMembers = [], initialSpouses = [] }: { defaultRootId?: string | null, initialMembers?: Member[], initialSpouses?: Spouse[] }) {
    const [members] = useState<Member[]>(initialMembers)
    const [spouses] = useState<Spouse[]>(initialSpouses)

    return (
        <div className="h-full flex flex-col bg-background font-sans antialiased overflow-hidden">
            <div className="flex-1 relative overflow-hidden">
                <ReactFlowProvider>
                    <TreeContent members={members} spouses={spouses} defaultRootId={defaultRootId} />
                </ReactFlowProvider>
            </div>
        </div>
    )
}
