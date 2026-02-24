'use client'

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    type NodeMouseHandler,
    ReactFlowProvider,
    useReactFlow,
    type Node,
    type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { PersonNode } from '@/components/tree/person-node'
import { buildTreeLayout, type PersonNode as PersonNodeType } from '@/lib/tree-layout'
import { getAllPeople } from '@/lib/supabase-data'
import { Person } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, X, Users, GitBranch, Share2, Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const nodeTypes = { person: PersonNode }

function PersonDetailPanel({ person, onClose }: { person: Person; onClose: () => void }) {
    return (
        <div className="absolute right-4 top-4 z-20 w-64 glass rounded-xl p-4 shadow-xl border border-border">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-xl border',
                        person.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30' :
                            person.gender === 'female' ? 'bg-rose-400/10 border-rose-400/30' : 'bg-muted border-border'
                    )}>
                        {person.gender === 'male' ? '👨' : person.gender === 'female' ? '👩' : '👤'}
                    </div>
                    <div>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            Thế hệ {person.generation}
                        </Badge>
                        <Badge variant={person.is_alive ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 ml-1">
                            {person.is_alive ? 'Còn sống' : 'Đã mất'}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-amber-500" onClick={() => {
                        const url = `${window.location.origin}/tree?root=${person.id}`
                        navigator.clipboard.writeText(url)
                        toast.success('Đã sao chép link chia sẻ nhánh!')
                    }} title="Chia sẻ nhánh này">
                        <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <h3 className="font-bold text-base leading-tight mb-1">{person.full_name}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
                {person.birth_year && (
                    <div className="flex justify-between">
                        <span>Năm sinh:</span>
                        <span className="text-foreground font-medium">{person.birth_year}</span>
                    </div>
                )}
                {person.death_year && (
                    <div className="flex justify-between">
                        <span>Năm mất:</span>
                        <span className="text-foreground font-medium">{person.death_year}</span>
                    </div>
                )}
                {person.notes && (
                    <p className="text-xs mt-2 italic border-t border-border pt-2">{person.notes}</p>
                )}
            </div>
        </div >
    )
}

function TreeContent({ people }: { people: Person[] }) {
    const { fitView, setCenter } = useReactFlow()
    const [nodes, setNodes, onNodesChange] = useNodesState<PersonNodeType>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [selected, setSelected] = useState<Person | null>(null)
    const [search, setSearch] = useState('')
    const searchParams = useSearchParams()
    const focusId = searchParams.get('focus')
    const rootId = searchParams.get('root')

    const displayPeople = useMemo(() => {
        if (!rootId) return people

        // Filter logic for sub-tree
        const childrenMap = new Map<string, string[]>()
        people.forEach(p => {
            if (p.father_id) {
                if (!childrenMap.has(p.father_id)) childrenMap.set(p.father_id, [])
                childrenMap.get(p.father_id)!.push(p.id)
            }
            if (p.mother_id) {
                if (!childrenMap.has(p.mother_id)) childrenMap.set(p.mother_id, [])
                childrenMap.get(p.mother_id)!.push(p.id)
            }
        })

        const result = new Set<string>()
        const queue = [rootId]
        while (queue.length > 0) {
            const curr = queue.shift()!
            if (result.has(curr)) continue
            result.add(curr)
            const children = childrenMap.get(curr) || []
            queue.push(...children)
        }

        // Include spouses? 
        return people.filter(p => result.has(p.id))
    }, [people, rootId])

    useEffect(() => {
        if (!focusId) return
        const p = displayPeople.find(x => x.id === focusId)
        if (p) setSelected(p)
    }, [focusId, displayPeople])

    const rawNodes = useRef<PersonNodeType[]>([])
    useEffect(() => {
        rawNodes.current = nodes
    }, [nodes])

    useEffect(() => {
        const { nodes: n, edges: e } = buildTreeLayout(displayPeople)
        setNodes(n)
        setEdges(e)
        setTimeout(() => fitView({ padding: 0.1 }), 100)
    }, [displayPeople, setNodes, setEdges, fitView])

    const filtered = useMemo(() => {
        if (!search.trim()) return new Set<string>()
        const q = search.toLowerCase()
        return new Set(displayPeople.filter(p => p.full_name.toLowerCase().includes(q)).map(p => p.id))
    }, [search, displayPeople])

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
    }, [filtered, focusId, setNodes, setCenter])

    const onNodeClick: NodeMouseHandler<PersonNodeType> = useCallback((_evt, node) => {
        const p = displayPeople.find(x => x.id === node.id)
        setSelected(p ?? null)
    }, [displayPeople])

    const stats = useMemo(() => ({
        total: displayPeople.length,
        alive: displayPeople.filter(p => p.is_alive).length,
        gens: new Set(displayPeople.map(p => p.generation)).size,
    }), [displayPeople])

    const handleExportPDF = async () => {
        const element = document.querySelector('.react-flow') as HTMLElement
        if (!element) return

        toast.loading('Đang xử lý PDF...', { id: 'pdf' })
        try {
            // Hide some UI elements before capture if needed
            const canvas = await html2canvas(element, {
                backgroundColor: '#09090b',
                scale: 2,
                ignoreElements: (el) => el.classList.contains('react-flow__controls') || el.classList.contains('react-flow__minimap')
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            })
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
            pdf.save('gia-pha-tran-toc.pdf')
            toast.success('Tải PDF thành công!', { id: 'pdf' })
        } catch (e) {
            console.error(e)
            toast.error('Lỗi khi xuất PDF', { id: 'pdf' })
        }
    }

    return (
        <div className="relative w-full h-full">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <div className="relative flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Tìm thành viên..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-8 h-8 w-52 text-sm glass border-border/60"
                        />
                        {search && (
                            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch('')}>
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    {rootId && (
                        <Button variant="outline" size="sm" className="h-8 text-xs bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20" onClick={() => window.location.href = '/tree'}>
                            Xem toàn bộ
                        </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-8 px-2 glass" onClick={handleExportPDF} title="Xuất PDF">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
                <div className="glass rounded-lg px-3 py-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{stats.total} thành viên ({stats.alive} còn sống)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GitBranch className="w-3 h-3" />
                        <span>{stats.gens} thế hệ</span>
                    </div>
                </div>
                {search && (
                    <div className="glass rounded-lg px-3 py-1.5 text-xs text-amber-700 font-medium">
                        {filtered.size === 0 ? 'Không tìm thấy' : `Tìm thấy ${filtered.size} người`}
                    </div>
                )}
            </div>

            {selected && <PersonDetailPanel person={selected} onClose={() => setSelected(null)} />}

            <ReactFlow
                colorMode="dark"
                className="bg-transparent"
                style={{ backgroundColor: 'transparent', '--xy-background-color': 'transparent' } as React.CSSProperties}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelected(null)}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                minZoom={0.1}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Controls className="!bg-background !border-border shadow-sm rounded-xl overflow-hidden [&>button]:!border-b-border [&>button]:!bg-background hover:[&>button]:!bg-muted [&>button>svg]:!fill-primary" />
                <MiniMap
                    nodeColor={(n: Node) => {
                        const gender = (n.data as PersonNodeType['data'])?.person?.gender
                        return gender === 'male' ? '#3b82f6' : gender === 'female' ? '#fb7185' : '#78350f'
                    }}
                    maskColor="rgba(0,0,0,0.05)"
                    className="!bg-background !border-border rounded-xl shadow-sm border overflow-hidden"
                />
            </ReactFlow>
        </div>
    )
}

export default function TreePage() {
    const [people, setPeople] = useState<Person[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAllPeople()
            .then(data => { setPeople(data); setLoading(false) })
            .catch(console.error)
    }, [])

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-border glass">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                        <span>🌳</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold leading-none">Cây Gia Phả</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Trần Tộc Mỹ Nguyên</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 rounded-full gold-gradient mx-auto animate-pulse flex items-center justify-center text-2xl">🌳</div>
                            <p className="text-sm text-muted-foreground">Đang tải cây gia phả...</p>
                        </div>
                    </div>
                ) : (
                    <ReactFlowProvider>
                        <Suspense fallback={null}>
                            <TreeContent people={people} />
                        </Suspense>
                    </ReactFlowProvider>
                )}
            </div>
        </div>
    )
}
