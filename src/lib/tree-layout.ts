import { Member, Spouse } from './types'
import { Node, Edge } from '@xyflow/react'

export type PersonNode = Node<{
    member: Member
    spouses: Spouse[] // Update to support multiple spouses
    hasChildren: boolean
    isHighlighted: boolean
}, 'person'>

const NODE_HEIGHT = 160
const H_GAP = 60
const V_GAP = 100

interface LayoutNode {
    member: Member
    spouses: Spouse[]
    x: number
    y: number
    width: number
    children: string[]
}

export function getNodeWidth(spousesCount: number) {
    // 1 base member
    const totalPeople = 1 + spousesCount
    // Each person block is ~120px wide
    // Plus 32px padding (16px left + 16px right)
    // Plus 28px for each ring badge between people
    return 32 + (totalPeople * 120) + (Math.max(0, totalPeople - 1) * 28)
}

/**
 * Build a tree layout using a simple top-down algorithm.
 * Positions nodes by generation row, distributing horizontally per family.
 */
export function buildTreeLayout(
    members: Member[],
    spouses: Spouse[] = []
): { nodes: PersonNode[]; edges: Edge[] } {
    if (!members.length) return { nodes: [], edges: [] }

    const map = new Map<string, Member>(members.map(m => [m.id, m]))
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

        let totalWidth = 0;
        const memberWidths = genMembers.map(m => {
            const spCount = spouseByMember.get(m.id)?.length || 0;
            const width = getNodeWidth(spCount);
            totalWidth += width;
            return width;
        });

        // Add gaps between members
        totalWidth += (genMembers.length - 1) * H_GAP

        const startX = -totalWidth / 2
        let currentX = startX;

        genMembers.forEach((m, colIdx) => {
            const w = memberWidths[colIdx];
            layoutMap.set(m.id, {
                member: m,
                spouses: spouseByMember.get(m.id) || [],
                x: currentX + w / 2, // Centered X
                y: rowIdx * (NODE_HEIGHT + V_GAP),
                width: w,
                children: childrenMap.get(m.id) ?? [],
            })
            currentX += w + H_GAP;
        })
    })

    // Build edges from father_id
    members.forEach(m => {
        if (m.father_id && layoutMap.has(m.father_id)) {
            edges.push({
                id: `${m.father_id}->${m.id}`,
                source: m.father_id,
                target: m.id,
                type: 'step', // Đường kẻ vuông góc 90 độ
                style: { stroke: '#F59E0B', strokeWidth: 2.5, opacity: 0.85 }, // Vàng Amber rực rỡ Heritage
                animated: false,
            })
        }
    })

    // Prepare Node configurations
    const nodes: PersonNode[] = Array.from(layoutMap.values()).map(ln => {
        return {
            id: ln.member.id,
            type: 'person',
            // ReactFlow anchor is top-left by default, but we calculated center X. We shift it by half width.
            position: { x: ln.x - ln.width / 2, y: ln.y },
            data: {
                member: ln.member,
                spouses: ln.spouses,
                hasChildren: ln.children.length > 0,
                isHighlighted: false,
            },
        }
    })

    return { nodes, edges }
}
