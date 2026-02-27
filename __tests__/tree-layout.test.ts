/**
 * Unit tests for tree-layout.ts
 * Tests the buildTreeLayout pure function with various member/spouse configurations.
 */
import { describe, it, expect } from 'vitest'
import { buildTreeLayout } from '@/lib/tree-layout'
import type { Member, Spouse } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMember(
    id: string,
    full_name: string,
    overrides: Partial<Member> = {}
): Member {
    return {
        id,
        full_name,
        gender: 'male',
        generation_level: 1,
        father_id: null,
        mother_id: null,
        birth_order: 0,
        metadata: null,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function makeSpouse(id: string, member_id: string, full_name: string): Spouse {
    return {
        id,
        member_id,
        full_name,
        role_type: 'chinh_that',
        status: 'active',
        metadata: null,
        created_at: null,
        updated_at: null,
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('buildTreeLayout', () => {

    it('returns empty nodes and edges for empty input', () => {
        const result = buildTreeLayout([])
        expect(result.nodes).toHaveLength(0)
        expect(result.edges).toHaveLength(0)
    })

    it('returns single node with no edges for single member', () => {
        const member = makeMember('root', 'Trần Văn Gốc')
        const result = buildTreeLayout([member])

        expect(result.nodes).toHaveLength(1)
        expect(result.edges).toHaveLength(0)
        expect(result.nodes[0].id).toBe('root')
        expect(result.nodes[0].type).toBe('person')
    })

    it('creates edge between father and child', () => {
        const father = makeMember('father', 'Cha', { generation_level: 1 })
        const child = makeMember('child', 'Con', { generation_level: 2, father_id: 'father' })

        const result = buildTreeLayout([father, child])

        expect(result.nodes).toHaveLength(2)
        expect(result.edges).toHaveLength(1)
        expect(result.edges[0].source).toBe('father')
        expect(result.edges[0].target).toBe('child')
    })

    it('does NOT create edge if father_id references non-existent member', () => {
        const child = makeMember('child', 'Con', {
            generation_level: 2,
            father_id: 'ghost-id',
        })

        const result = buildTreeLayout([child])

        expect(result.nodes).toHaveLength(1)
        expect(result.edges).toHaveLength(0)
    })

    it('creates multiple edges for multiple children', () => {
        const father = makeMember('father', 'Cha', { generation_level: 1 })
        const child1 = makeMember('child1', 'Con1', { generation_level: 2, father_id: 'father', birth_order: 0 })
        const child2 = makeMember('child2', 'Con2', { generation_level: 2, father_id: 'father', birth_order: 1 })

        const result = buildTreeLayout([father, child1, child2])

        expect(result.nodes).toHaveLength(3)
        expect(result.edges).toHaveLength(2)
    })

    it('positions nodes in different rows by generation_level', () => {
        const gen1 = makeMember('g1', 'Thế hệ 1', { generation_level: 1 })
        const gen2 = makeMember('g2', 'Thế hệ 2', { generation_level: 2, father_id: 'g1' })
        const gen3 = makeMember('g3', 'Thế hệ 3', { generation_level: 3, father_id: 'g2' })

        const result = buildTreeLayout([gen1, gen2, gen3])

        const yPositions = result.nodes.map(n => n.position.y).sort((a, b) => a - b)
        // Each generation should be in a different Y row
        expect(yPositions[0]).toBeLessThan(yPositions[1])
        expect(yPositions[1]).toBeLessThan(yPositions[2])
    })

    it('attaches spouse to correct member in node data', () => {
        const member = makeMember('m1', 'Trần Văn A')
        const spouse = makeSpouse('s1', 'm1', 'Nguyễn Thị B')

        const result = buildTreeLayout([member], [spouse])

        const node = result.nodes.find(n => n.id === 'm1')
        expect(node?.data.spouses?.[0]?.id).toBe('s1')
        expect(node?.data.spouses?.[0]?.full_name).toBe('Nguyễn Thị B')
    })

    it('marks hasChildren correctly', () => {
        const father = makeMember('father', 'Cha', { generation_level: 1 })
        const child = makeMember('child', 'Con', { generation_level: 2, father_id: 'father' })

        const result = buildTreeLayout([father, child])

        const fatherNode = result.nodes.find(n => n.id === 'father')
        const childNode = result.nodes.find(n => n.id === 'child')

        expect(fatherNode?.data.hasChildren).toBe(true)
        expect(childNode?.data.hasChildren).toBe(false)
    })

    it('sorts siblings by birth_order', () => {
        const father = makeMember('father', 'Cha', { generation_level: 1 })
        const firstBorn = makeMember('first', 'Con Cả', {
            generation_level: 2,
            father_id: 'father',
            birth_order: 0,
        })
        const secondBorn = makeMember('second', 'Con Hai', {
            generation_level: 2,
            father_id: 'father',
            birth_order: 1,
        })

        // Pass in reversed order to test sorting
        const result = buildTreeLayout([father, secondBorn, firstBorn])

        const gen2Nodes = result.nodes.filter(n => {
            const m = [firstBorn, secondBorn].find(m => m.id === n.id)
            return !!m
        })

        // firstBorn (birth_order=0) should have smaller X than secondBorn (birth_order=1)
        const firstNode = result.nodes.find(n => n.id === 'first')
        const secondNode = result.nodes.find(n => n.id === 'second')
        expect(firstNode!.position.x).toBeLessThan(secondNode!.position.x)
    })

    it('uses step edge type for family connections', () => {
        const father = makeMember('father', 'Cha', { generation_level: 1 })
        const child = makeMember('child', 'Con', { generation_level: 2, father_id: 'father' })

        const result = buildTreeLayout([father, child])

        expect(result.edges[0].type).toBe('step')
    })
})
