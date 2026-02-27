import { useMemo, useState } from 'react'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

// Cấu trúc Node cây đệ quy
type TreeNode = Member & {
    children: TreeNode[]
    spouses: Spouse[]
}

// 1. Hàm dựng Cây (Build Tree từ Flat List)
function buildMindmapTree(displayMembers: Member[], spouses: Spouse[], rootId: string | null): TreeNode[] {
    const memberMap = new Map<string, TreeNode>()

    // Initialize all nodes
    displayMembers.forEach(m => {
        memberMap.set(m.id, {
            ...m,
            children: [],
            spouses: spouses.filter(s => s.member_id === m.id)
        })
    })

    const roots: TreeNode[] = []

    displayMembers.forEach(m => {
        const node = memberMap.get(m.id)!
        if (m.father_id && memberMap.has(m.father_id)) {
            // Có cha trong danh sách hiển thị
            memberMap.get(m.father_id)!.children.push(node)
        } else {
            // Không có cha = Rễ của cây con này
            roots.push(node)
        }
    })

    // Sắp xếp các con theo đúng thứ tự (birth_order)
    memberMap.forEach(node => {
        node.children.sort((a, b) => (a.birth_order || 99) - (b.birth_order || 99))
    })

    // Lọc lấy Root từ người khởi tạo thay vì chùm roots rải rác nếu được cấp rootId
    if (rootId && memberMap.has(rootId)) {
        return [memberMap.get(rootId)!]
    }

    return roots
}

// 2. Component Hiện 1 Nút trên Cây ngang (Mindmap Node) đệ quy
function MindmapNode({
    node,
    depth = 0,
    isLast = false,
    selectedId,
    onSelect
}: {
    node: TreeNode,
    depth?: number,
    isLast?: boolean,
    selectedId: string | null,
    onSelect: (m: Member) => void
}) {
    // Mặc định cây sẽ mở ra 2 đời, đời 3 trở đi đóng lại cho gọn
    const [isExpanded, setIsExpanded] = useState(depth < 2)
    const hasChildren = node.children.length > 0
    const meta = (node.metadata as MemberMetadata) || {}
    const isSelected = selectedId === node.id

    return (
        <div className="relative flex flex-col items-start mt-2">
            <div className="flex items-center group relative z-10 w-max pr-8">

                {/* Nút bấm +/- nếu có con cháu */}
                {hasChildren ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "absolute -left-3 z-20 w-5 h-5 rounded flex items-center justify-center text-[10px] sm:text-xs transition-colors shadow-sm",
                            isExpanded ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                    >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                ) : (
                    // Dấu tròn điểm mù nếu hết đời
                    <div className="absolute -left-1.5 z-20 w-2 h-2 rounded-full bg-border" />
                )}

                {/* Khối Thông tin Thành viên chính */}
                <div
                    onClick={() => onSelect(node)}
                    className={cn(
                        "ml-4 pl-2 pr-4 py-2 flex items-center gap-3 rounded-xl border transition-all cursor-pointer shadow-sm min-w-48 sm:min-w-56",
                        isSelected
                            ? "bg-amber-500/10 border-amber-500/40 ring-2 ring-amber-500/20"
                            : "bg-card border-border hover:border-amber-500/30 hover:bg-accent/40"
                    )}
                >
                    <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm border shrink-0',
                        node.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30' :
                            node.gender === 'female' ? 'bg-rose-400/10 border-rose-400/30' : 'bg-muted border-border'
                    )}>
                        {node.gender === 'male' ? '👨' : node.gender === 'female' ? '👩' : '👤'}
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-sm truncate">{node.full_name}</h4>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 font-normal shrink-0">Đ.{node.generation_level}</Badge>
                        </div>
                        <div className="flex text-[10px] text-muted-foreground gap-1.5 mt-0.5">
                            {meta.birth_year ? <span>{meta.birth_year}</span> : <span>Chưa rõ</span>}
                            <span>-</span>
                            {meta.is_alive !== false ? (
                                <span className="text-green-600 font-medium">Đang sống</span>
                            ) : (
                                <span>{meta.death_year || 'Đã mất'}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Render List Spouses Nằm kế bên nếu tồn tại (Icon thu nhỏ) */}
                {node.spouses.length > 0 && (
                    <div className="ml-3 flex gap-2">
                        {node.spouses.map(s => {
                            const smeta = (s.metadata as MemberMetadata) || {}
                            return (
                                <div key={s.id}
                                    title={`Phối ngẫu: ${s.full_name} ${smeta.birth_year ? `(${smeta.birth_year})` : ''}`}
                                    className="flex items-center gap-1.5 px-2 py-1.5 bg-secondary/60 border border-border/60 rounded-lg text-xs hover:bg-secondary cursor-help transition-colors shadow-sm"
                                >
                                    <span className="text-rose-400">💍</span>
                                    <span className="font-medium whitespace-nowrap max-w-24 truncate">{s.full_name}</span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Các nhánh con - Bọc trong AnimatePresence cho mượt */}
            <AnimatePresence initial={false}>
                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-8 pt-2 relative border-l-2 border-border/40 pl-6 w-full"
                    >
                        {/* Đường nối rễ từ Cha sang Con (Nằm chìm) */}
                        <div className="absolute top-0 bottom-6 left-0 w-4 border-b-2 gap-y border-border/40 rounded-bl-xl pointer-events-none" />

                        {node.children.map((child, idx) => (
                            <MindmapNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                isLast={idx === node.children.length - 1}
                                selectedId={selectedId}
                                onSelect={onSelect}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// 3. Container Bọc Ngoài Cây Mindmap
export function HorizontalMindmap({
    members,
    spouses,
    rootId,
    selectedId,
    onSelect
}: {
    members: Member[],
    spouses: Spouse[],
    rootId: string | null,
    selectedId: string | null,
    onSelect: (m: Member) => void
}) {
    const trees = useMemo(() => buildMindmapTree(members, spouses, rootId), [members, spouses, rootId])

    if (trees.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8 text-muted-foreground text-sm">
                Không có dữ liệu thuộc nhánh cây này.
            </div>
        )
    }

    return (
        <div className="absolute inset-0 overflow-auto cursor-grab active:cursor-grabbing p-6 sm:p-12 no-scrollbar bg-dot-pattern bg-[length:24px_24px]">
            <div className="min-w-max pb-32">
                {trees.map((tree, i) => (
                    <div key={tree.id} className={cn(i > 0 && "mt-12")}>
                        <MindmapNode
                            node={tree}
                            depth={0}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}
