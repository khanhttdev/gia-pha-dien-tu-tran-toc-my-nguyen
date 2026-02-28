'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
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
    const { fitView, setCenter, getNodes } = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [selected, setSelected] = useState<Member | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [nodeLimit, setNodeLimit] = useState(15)

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

    const { displayMembers, hasMore, totalInTree } = useMemo(() => {
        if (!activeRootId) return { displayMembers: members, hasMore: false, totalInTree: members.length }

        const childrenMap = new Map<string, string[]>()
        members.forEach(m => {
            if (m.father_id) {
                if (!childrenMap.has(m.father_id)) childrenMap.set(m.father_id, [])
                childrenMap.get(m.father_id)!.push(m.id)
            }
        })

        const orderedNodes: string[] = []
        const visited = new Set<string>()
        const queue = [activeRootId]

        while (queue.length > 0) {
            const curr = queue.shift()!
            if (visited.has(curr)) continue
            visited.add(curr)
            orderedNodes.push(curr)
            const children = childrenMap.get(curr) || []
            queue.push(...children)
        }

        let effectiveLimit = nodeLimit

        if (focusId && visited.has(focusId)) {
            const idx = orderedNodes.indexOf(focusId)
            if (idx >= effectiveLimit) effectiveLimit = idx + 1
        }

        if (search.trim()) {
            const q = search.toLowerCase()
            const matches = members.filter(m => visited.has(m.id) && m.full_name.toLowerCase().includes(q))
            if (matches.length > 0) {
                const maxIdx = Math.max(...matches.map(m => orderedNodes.indexOf(m.id)))
                if (maxIdx >= effectiveLimit) effectiveLimit = maxIdx + 1
            }
        }

        const resultIds = new Set(orderedNodes.slice(0, effectiveLimit))

        return {
            displayMembers: members.filter(m => resultIds.has(m.id)),
            hasMore: effectiveLimit < orderedNodes.length,
            totalInTree: orderedNodes.length
        }
    }, [members, activeRootId, nodeLimit, focusId, search])

    useEffect(() => {
        if (!focusId) return
        const m = displayMembers.find(x => x.id === focusId)
        if (m) setSelected(m)
    }, [focusId, displayMembers])

    const prevRootId = useRef<string | null>(null)
    useEffect(() => {
        const { nodes: n, edges: e } = buildTreeLayout(displayMembers, spouses)
        setNodes(n)
        setEdges(e)

        if (prevRootId.current !== activeRootId) {
            prevRootId.current = activeRootId
            setTimeout(() => fitView({ padding: 0.2 }), 300)
        }
    }, [displayMembers, spouses, setNodes, setEdges, activeRootId, fitView])

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
        if ((filtered.size === 1 || focusId) && (search.trim() || focusId)) {
            const idToFocus = focusId || Array.from(filtered)[0]
            const currentNodes = getNodes()
            const node = currentNodes.find((n: Node) => n.id === idToFocus)
            if (node) {
                setTimeout(() => setCenter(node.position.x + 90, node.position.y + 40, { zoom: 1.2, duration: 600 }), 100)
            }
        }
    }, [search, focusId, setNodes, setCenter, filtered, getNodes])

    const onNodeClick: NodeMouseHandler<Node> = useCallback((_evt, node) => {
        const m = displayMembers.find(x => x.id === node.id)
        if (m) {
            setSelected(m)
            setIsPanelOpen(true)
        }
    }, [displayMembers])

    // Infinite Scroll handler - Tự động tải thêm khi cuộn chuột
    const handleMoveEnd = useCallback(() => {
        if (hasMore) {
            setNodeLimit(prev => Math.min(prev + 15, totalInTree))
        }
    }, [hasMore, totalInTree])

    const stats = useMemo(() => ({
        total: totalInTree,
        gens: displayMembers.length > 0 ? new Set(displayMembers.map(m => m.generation_level)).size : 0,
    }), [totalInTree, displayMembers])

    return (
        <div className="flex flex-col w-full h-full bg-[#1B0506] overflow-hidden relative font-serif">
            {/* Chronicles Central Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-2xl px-4 pointer-events-none">
                <header className="pointer-events-auto bg-[#1B0506]/90 backdrop-blur-md border-[1.5px] border-amber-600/30 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-4 flex flex-col items-center relative overflow-hidden group">
                    {/* Decorative Header Border */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

                    <div className="flex items-center gap-6">
                        {/* Golden Tree Logo - Heritage Icon */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-700">
                            <div className="w-full h-full rounded-full bg-[#1B0506] flex items-center justify-center">
                                <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">🌳</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold tracking-[0.4em] text-amber-500/60 uppercase leading-none mb-1">THE CHRONICLES OF</span>
                            <h1 className="text-2xl font-black tracking-tight text-amber-50 uppercase leading-none drop-shadow-md">
                                GIA PHẢ <span className="text-amber-500 font-serif lowercase italic font-normal">họ</span> TRẦN
                            </h1>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/40" />
                                <span className="text-[10px] font-medium text-amber-500/40 italic tracking-widest">Legacy & Lineage</span>
                                <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/40" />
                            </div>
                        </div>
                    </div>

                    {/* Stats & Search Floating Bar */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 w-full justify-center">
                        <div className="flex items-center gap-2 group/search shadow-sm rounded-lg shrink-0">
                            <Search className="w-3.5 h-3.5 text-amber-500/40 group-focus-within/search:text-amber-500 transition-colors" />
                            <Input
                                placeholder="Truy tìm tiên tổ..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-7 w-40 bg-white/5 border-white/10 focus-visible:ring-amber-500/20 rounded-lg font-medium text-[10px] text-amber-50 placeholder:text-white/20 border-none outline-none"
                            />
                        </div>
                        <div className="px-3 py-1 bg-amber-500/5 rounded-lg border border-amber-500/20">
                            <span className="text-[9px] font-black text-amber-500/70 uppercase tracking-tighter">
                                {displayMembers.length} / {stats.total} THÀNH VIÊN
                            </span>
                        </div>
                        {hasMore && (
                            <div className="text-[9px] text-amber-500/50 animate-pulse uppercase tracking-wider font-bold">
                                Cuộn để tải thêm...
                            </div>
                        )}
                    </div>
                </header>
            </div>

            {/* Ancestry Breadcrumbs - Floating Bottom Left */}
            <div className="absolute bottom-6 left-6 z-[400] max-w-[320px]">
                <div className="bg-[#1B0506]/90 backdrop-blur-md border border-amber-600/30 rounded-xl p-3 shadow-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase text-amber-500/60 tracking-widest flex items-center gap-2">
                            <Waypoints size={10} /> Phả Hệ Đang Xem
                        </span>
                        {(urlRootId || (defaultRootId && activeRootId !== defaultRootId)) && (
                            <button onClick={() => window.location.href = '/tree'} className="text-[8px] text-amber-400 hover:text-amber-300 font-bold uppercase transition-colors">Về Thủy Tổ</button>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {ancestryTrail.length > 0 ? ancestryTrail.map((m, idx) => (
                            <React.Fragment key={m.id}>
                                <button
                                    onClick={() => window.location.href = `/tree?root=${m.id}`}
                                    className={cn(
                                        "text-[9px] px-2 py-0.5 rounded transition-all border font-bold uppercase tracking-tighter whitespace-nowrap",
                                        m.id === (selected?.id || activeRootId)
                                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                            : "bg-white/5 border-white/5 text-amber-50/40 hover:border-amber-500/40 hover:text-amber-400"
                                    )}
                                >
                                    {m.full_name.split(' ').pop()}
                                </button>
                                {idx < ancestryTrail.length - 1 && <ChevronRight size={10} className="text-amber-500/20" />}
                            </React.Fragment>
                        )) : (
                            <div className="text-[9px] text-white/20 italic">Chọn một nút để xem dòng tộc...</div>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-1 relative overflow-hidden z-0">
                {/* Subtle Background Ornament Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] mix-blend-overlay" />

                {/* Vertical Timeline - Left Side Indicator */}
                <div className="absolute top-0 left-4 bottom-0 w-12 z-20 flex flex-col items-center py-60 gap-40 pointer-events-none select-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                        <div key={g} className="flex flex-col items-center gap-3 group">
                            <div className="text-[10px] font-black text-amber-600/30 rotate-180 [writing-mode:vertical-lr] tracking-[0.5em] transition-all duration-700">GEN 0{g}</div>
                            <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-amber-600/20 to-transparent" />
                        </div>
                    ))}
                </div>

                <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-[#1B0506]"><div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" /></div>}>
                    <ReactFlow
                        colorMode="dark"
                        className="bg-transparent"
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onPaneClick={() => setSelected(null)}
                        onMoveEnd={handleMoveEnd}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        minZoom={0.05}
                        maxZoom={2}
                        proOptions={{ hideAttribution: true }}
                    >
                        <Controls className="!bg-[#1B0506]/80 !border-amber-600/30 shadow-2xl rounded-xl overflow-hidden p-1 [&>button]:!bg-transparent [&>button]:!border-none [&>button]:!fill-amber-500/50 hover:[&>button]:!fill-amber-400" />
                        <MiniMap
                            nodeColor={(n: Node) => {
                                const m = (n.data as any)?.member
                                return m?.gender === 'male' ? '#3B82F6' : m?.gender === 'female' ? '#EC4899' : '#D97706'
                            }}
                            className="!bg-[#1B0506]/90 !border-amber-600/30 rounded-xl shadow-2xl overflow-hidden hidden md:block"
                            maskColor="rgba(27, 5, 6, 0.8)"
                        />
                        <Background color="#F59E0B" gap={40} size={1} variant={undefined as any} className="opacity-[0.03]" />
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
