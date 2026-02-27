'use client'

import { useMemo, useState } from 'react'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown, User, Heart } from 'lucide-react'
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
            memberMap.get(m.father_id)!.children.push(node)
        } else {
            roots.push(node)
        }
    })

    memberMap.forEach(node => {
        node.children.sort((a, b) => (a.birth_order || 99) - (b.birth_order || 99))
    })

    if (rootId && memberMap.has(rootId)) {
        return [memberMap.get(rootId)!]
    }

    return roots
}

// 2. Component Node Đơn lẻ (Gia Phả OS Style)
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
    const [isExpanded, setIsExpanded] = useState(depth < 2)
    const hasChildren = node.children.length > 0
    const meta = (node.metadata as MemberMetadata) || {}
    const isSelected = selectedId === node.id

    return (
        <div className="flex flex-col w-full">
            {/* ROW: Chứa thông tin thành viên */}
            <div className="relative flex items-center h-12 group/row">

                {/* CONNECTORS: Đường kẻ chữ L */}
                {depth > 0 && (
                    <>
                        {/* Đường dọc từ trên xuống (chỉ hiện nếu không phải Root) */}
                        <div className={cn(
                            "absolute left-[-24px] top-[-24px] w-px bg-border group-hover/row:bg-amber-500/50 transition-colors",
                            isLast ? "h-[48px]" : "h-[72px]"
                        )} />
                        {/* Đường ngang nối vào Node */}
                        <div className="absolute left-[-24px] top-1/2 w-4 h-px bg-border group-hover/row:bg-amber-500/50 transition-colors" />
                    </>
                )}

                {/* THẺ THÀNH VIÊN: Tối giản, Gọn gàng */}
                <div
                    onClick={() => onSelect(node)}
                    className={cn(
                        "flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-xl border transition-all cursor-pointer select-none",
                        isSelected
                            ? "bg-amber-500/10 border-amber-500 shadow-sm"
                            : "bg-background border-transparent hover:bg-muted/50 hover:border-border/60"
                    )}
                >
                    {/* Giới tính Icon */}
                    <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 border",
                        node.gender === 'male' ? "bg-blue-500/10 border-blue-200 text-blue-600" :
                            node.gender === 'female' ? "bg-rose-500/10 border-rose-200 text-rose-600" : "bg-muted border-border"
                    )}>
                        {node.gender === 'male' ? '♂' : node.gender === 'female' ? '♀' : '?'}
                    </div>

                    {/* Tên & Đời */}
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-sm font-black whitespace-nowrap tracking-tight",
                            isSelected ? "text-amber-600" : "text-foreground"
                        )}>
                            {node.full_name}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                            Đ.{node.generation_level}
                        </span>
                    </div>

                    {/* Vợ/Chồng Badge (Mini) */}
                    {node.spouses.length > 0 && (
                        <div className="flex bg-rose-500/5 items-center gap-1.5 px-2 py-0.5 rounded-full border border-rose-200/50">
                            <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400/20" />
                            <span className="text-[10px] font-bold text-rose-600/80 max-w-[80px] truncate">
                                {node.spouses[0].full_name}
                                {node.spouses.length > 1 && ` +${node.spouses.length - 1}`}
                            </span>
                        </div>
                    )}

                    {/* Nút Đóng/Mở (Gia Phả OS Style) */}
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsExpanded(!isExpanded)
                            }}
                            className={cn(
                                "ml-2 p-1 rounded-md hover:bg-muted transition-colors",
                                isExpanded ? "text-amber-600" : "text-muted-foreground"
                            )}
                        >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>

            {/* CHILDREN: Thụt lề và render đệ quy */}
            <AnimatePresence initial={false}>
                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="pl-12 overflow-hidden flex flex-col"
                    >
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

// 3. Container Bọc Ngoài (Gia Phả OS Style)
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
            <div className="w-full h-full flex items-center justify-center p-8 text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-40">
                Không tìm thấy dữ liệu cây
            </div>
        )
    }

    return (
        <div className="w-full h-full p-8 md:p-16 overflow-auto bg-background selection:bg-amber-500/20">
            <div className="max-w-4xl">
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
            {/* Safe space at bottom */}
            <div className="h-64 w-full" />
        </div>
    )
}
