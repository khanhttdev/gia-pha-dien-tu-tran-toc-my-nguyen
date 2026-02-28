import { Member, Spouse } from './types'
import { Node, Edge } from '@xyflow/react'

export type PersonNode = Node<{
    member: Member
    spouses: Spouse[] // Update to support multiple spouses
    hasChildren: boolean
    isHighlighted: boolean
}, 'person'>

const NODE_HEIGHT = 160
const H_GAP = 50
const V_GAP = 80

interface LayoutNode {
    member: Member
    spouses: Spouse[]
    x: number
    y: number
    width: number
    subtreeWidth: number
    children: string[]
}

export function getNodeWidth(spousesCount: number) {
    // Every ProfileBlock is 140px wide
    const totalPeople = 1 + spousesCount
    // Each person block is 140px
    // Spouses are separated by a tiny 4px divider
    return (totalPeople * 140) + (Math.max(0, totalPeople - 1) * 8) + 12 // 12 for padding
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

    const layoutMap = new Map<string, LayoutNode>()

    // Determine min generation for Y offset
    const minGen = Math.min(...members.map(m => m.generation_level ?? 1))

    // Initialize layout nodes
    members.forEach(m => {
        const spCount = spouseByMember.get(m.id)?.length || 0;
        layoutMap.set(m.id, {
            member: m,
            spouses: spouseByMember.get(m.id) || [],
            x: 0,
            y: ((m.generation_level ?? 1) - minGen) * (NODE_HEIGHT + V_GAP),
            width: getNodeWidth(spCount),
            subtreeWidth: 0,
            children: childrenMap.get(m.id) ?? []
        })
    })

    // Calculate subtree widths (bottom-up)
    // Sort by generation descending to ensure children are processed before parents
    const sortedDesc = [...members].sort((a, b) => (b.generation_level ?? 0) - (a.generation_level ?? 0))

    sortedDesc.forEach(m => {
        const node = layoutMap.get(m.id)!
        if (node.children.length === 0) {
            node.subtreeWidth = node.width
        } else {
            const childrenNodes = node.children.map(cid => layoutMap.get(cid)).filter(Boolean) as LayoutNode[]
            const totalChildrenWidth = childrenNodes.reduce((sum, n) => sum + n.subtreeWidth, 0) + Math.max(0, childrenNodes.length - 1) * H_GAP
            // Subtree is at least as wide as the node itself
            node.subtreeWidth = Math.max(node.width, totalChildrenWidth)
        }
    })

    // Calculate X positions (top-down)
    const roots = members.filter(m => !m.father_id || !map.has(m.father_id))

    let currentRootX = 0

    function calculatePositions(node: LayoutNode, centerX: number) {
        node.x = centerX

        if (node.children.length > 0) {
            const childrenNodes = node.children.map(cid => layoutMap.get(cid)).filter(Boolean) as LayoutNode[]
            const totalChildrenWidth = childrenNodes.reduce((sum, n) => sum + n.subtreeWidth, 0) + Math.max(0, childrenNodes.length - 1) * H_GAP

            let currentChildX = centerX - totalChildrenWidth / 2

            childrenNodes.forEach(child => {
                const childCenterX = currentChildX + child.subtreeWidth / 2
                calculatePositions(child, childCenterX)
                currentChildX += child.subtreeWidth + H_GAP
            })
        }
    }

    roots.forEach(r => {
        const rootNode = layoutMap.get(r.id)!
        calculatePositions(rootNode, currentRootX + rootNode.subtreeWidth / 2)
        currentRootX += rootNode.subtreeWidth + H_GAP * 2 // Add extra gap between different root families
    })

    // Build edges from father_id
    members.forEach(m => {
        if (m.father_id && layoutMap.has(m.father_id)) {
            edges.push({
                id: `${m.father_id}->${m.id}`,
                source: m.father_id,
                target: m.id,
                type: 'smoothstep', // Dùng smoothstep cho mượt mà, không bị gắt
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
