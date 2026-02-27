import { Member, Spouse } from './types'
import { Node, Edge } from '@xyflow/react'

export type PersonNode = Node<{
    member: Member
    spouse?: Spouse
    hasChildren: boolean
    isHighlighted: boolean
}, 'person'>

const NODE_WIDTH = 280 // Tăng chiều rộng để chứa 2 người (member + spouse)
const NODE_HEIGHT = 120
const H_GAP = 40      // Thu hẹp khoảng cách ngang một chút
const V_GAP = 100

interface LayoutNode {
    member: Member
    x: number
    y: number
    children: string[]
}

/**
 * Build a tree layout using a simple top-down algorithm.
 * Positions nodes by generation row, distributing horizontally per family.
 * Uses father_id as the backbone for tree traversal (members table only).
 */
export function buildTreeLayout(
    members: Member[],
    spouses: Spouse[] = []
): { nodes: PersonNode[]; edges: Edge[] } {
    if (!members.length) return { nodes: [], edges: [] }

    const map = new Map<string, Member>(members.map(m => [m.id, m]))
    const spouseMap = new Map<string, Spouse>(spouses.map(s => [s.id, s]))
    const spouseByMember = new Map<string, Spouse[]>()
    spouses.forEach(s => {
        if (!spouseByMember.has(s.member_id)) spouseByMember.set(s.member_id, [])
        spouseByMember.get(s.member_id)!.push(s)
    })

    const childrenMap = new Map<string, string[]>()
    const edges: Edge[] = []

    // Build children map using father_id as backbone
    members.forEach(m => {
        if (m.father_id && map.has(m.father_id)) {
            if (!childrenMap.has(m.father_id)) childrenMap.set(m.father_id, [])
            childrenMap.get(m.father_id)!.push(m.id)
        }
    })

    // Group by generation_level
    const byGen = new Map<number, Member[]>()
    members.forEach(m => {
        const gen = m.generation_level ?? 1
        if (!byGen.has(gen)) byGen.set(gen, [])
        byGen.get(gen)!.push(m)
    })

    const sortedGens = Array.from(byGen.keys()).sort((a, b) => a - b)
    const layoutMap = new Map<string, LayoutNode>()

    // Position nodes row by row
    sortedGens.forEach((gen, rowIdx) => {
        const genMembers = byGen.get(gen)!.sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0))
        const totalWidth = genMembers.length * NODE_WIDTH + (genMembers.length - 1) * H_GAP
        const startX = -totalWidth / 2

        genMembers.forEach((m, colIdx) => {
            layoutMap.set(m.id, {
                member: m,
                x: startX + colIdx * (NODE_WIDTH + H_GAP),
                y: rowIdx * (NODE_HEIGHT + V_GAP),
                children: childrenMap.get(m.id) ?? [],
            })
        })
    })

    // Build edges from father_id
    members.forEach(m => {
        if (m.father_id && layoutMap.has(m.father_id)) {
            edges.push({
                id: `${m.father_id}->${m.id}`,
                source: m.father_id,
                target: m.id,
                type: 'smoothstep', // Dùng smoothstep/step để tạo đường kẻ vuông góc
                style: { stroke: 'rgba(214, 211, 209, 0.5)', strokeWidth: 2 }, // Màu xám nhạt Stone-300 (giống bản gốc) pha thêm độ mờ của kính
                animated: false,
            })
        }
    })

    const nodes: PersonNode[] = Array.from(layoutMap.values()).map(ln => {
        const memberSpouses = spouseByMember.get(ln.member.id)
        return {
            id: ln.member.id,
            type: 'person',
            position: { x: ln.x, y: ln.y },
            data: {
                member: ln.member,
                spouse: memberSpouses?.[0],
                hasChildren: ln.children.length > 0,
                isHighlighted: false,
            },
        }
    })

    return { nodes, edges }
}
