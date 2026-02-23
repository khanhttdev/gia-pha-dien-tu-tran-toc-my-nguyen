import { Person } from './types'
import { Node, Edge } from '@xyflow/react'

export type PersonNode = Node<{
    person: Person
    hasChildren: boolean
    isHighlighted: boolean
}, 'person'>

const NODE_WIDTH = 180
const NODE_HEIGHT = 80
const H_GAP = 60
const V_GAP = 100

interface LayoutNode {
    person: Person
    x: number
    y: number
    children: string[]
}

/**
 * Build a tree layout using a simple top-down algorithm.
 * Positions nodes by generation row, distributing horizontally per family.
 */
export function buildTreeLayout(people: Person[]): { nodes: PersonNode[]; edges: Edge[] } {
    if (!people.length) return { nodes: [], edges: [] }

    const map = new Map<string, Person>(people.map(p => [p.id, p]))
    const childrenMap = new Map<string, string[]>()
    const edges: Edge[] = []

    // Build children map
    people.forEach(p => {
        if (p.father_id && map.has(p.father_id)) {
            if (!childrenMap.has(p.father_id)) childrenMap.set(p.father_id, [])
            childrenMap.get(p.father_id)!.push(p.id)
        } else if (p.mother_id && map.has(p.mother_id)) {
            if (!childrenMap.has(p.mother_id)) childrenMap.set(p.mother_id, [])
            childrenMap.get(p.mother_id)!.push(p.id)
        }
    })

    // Group by generation
    const byGen = new Map<number, Person[]>()
    people.forEach(p => {
        const gen = p.generation ?? 1
        if (!byGen.has(gen)) byGen.set(gen, [])
        byGen.get(gen)!.push(p)
    })

    const sortedGens = Array.from(byGen.keys()).sort((a, b) => a - b)
    const layoutMap = new Map<string, LayoutNode>()

    // Position nodes row by row
    sortedGens.forEach((gen, rowIdx) => {
        const members = byGen.get(gen)!.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        const totalWidth = members.length * NODE_WIDTH + (members.length - 1) * H_GAP
        const startX = -totalWidth / 2

        members.forEach((p, colIdx) => {
            layoutMap.set(p.id, {
                person: p,
                x: startX + colIdx * (NODE_WIDTH + H_GAP),
                y: rowIdx * (NODE_HEIGHT + V_GAP),
                children: childrenMap.get(p.id) ?? [],
            })
        })
    })

    // Build edges
    people.forEach(p => {
        if (p.father_id && layoutMap.has(p.father_id)) {
            edges.push({
                id: `${p.father_id}->${p.id}`,
                source: p.father_id,
                target: p.id,
                type: 'smoothstep',
                style: { stroke: '#d97706', strokeWidth: 1.5, opacity: 0.7 },
                animated: false,
            })
        } else if (p.mother_id && layoutMap.has(p.mother_id)) {
            edges.push({
                id: `${p.mother_id}->${p.id}`,
                source: p.mother_id,
                target: p.id,
                type: 'smoothstep',
                style: { stroke: '#b45309', strokeWidth: 1.5, opacity: 0.5, strokeDasharray: '4 4' },
                animated: false,
            })
        }
    })

    const nodes: PersonNode[] = Array.from(layoutMap.values()).map(ln => ({
        id: ln.person.id,
        type: 'person',
        position: { x: ln.x, y: ln.y },
        data: {
            person: ln.person,
            hasChildren: ln.children.length > 0,
            isHighlighted: false,
        },
    }))

    return { nodes, edges }
}
