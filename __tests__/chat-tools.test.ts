/**
 * Unit tests for chat-tools.ts
 * Tests the BFS relationship finder and family statistics logic.
 * Supabase calls are mocked to keep tests pure/offline.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Member } from '@/lib/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMember(overrides: Partial<Member> & { id: string; full_name: string }): Member {
    return {
        id: overrides.id,
        full_name: overrides.full_name,
        gender: overrides.gender ?? 'male',
        generation_level: overrides.generation_level ?? 1,
        father_id: overrides.father_id ?? null,
        mother_id: overrides.mother_id ?? null,
        birth_order: overrides.birth_order ?? 0,
        metadata: overrides.metadata ?? null,
        created_at: null,
        updated_at: null,
    }
}

// ─── Fixture Data ─────────────────────────────────────────────────────────────
//
//  ông (F1)
//  └── cha (F2)
//      ├── con1 (F3)   ← sibling với con2
//      └── con2 (F3)
//

const ong = makeMember({ id: 'ong', full_name: 'Trần Văn Ông', generation_level: 1 })
const cha = makeMember({ id: 'cha', full_name: 'Trần Văn Cha', generation_level: 2, father_id: 'ong' })
const con1 = makeMember({ id: 'con1', full_name: 'Trần Văn Con1', generation_level: 3, father_id: 'cha' })
const con2 = makeMember({ id: 'con2', full_name: 'Trần Thị Con2', gender: 'female', generation_level: 3, father_id: 'cha' })
const stranger = makeMember({ id: 'stranger', full_name: 'Nguyễn Văn Lạ', generation_level: 1 })

const MEMBERS = [ong, cha, con1, con2]

// ─── Mock Supabase Server ─────────────────────────────────────────────────────

// We mock the entire module so createClient never touches the network.
vi.mock('@/lib/supabase-server', () => ({
    createClient: vi.fn(),
}))

// ─── Import AFTER mocking ─────────────────────────────────────────────────────

import { executeTool } from '@/lib/chat-tools'
import { createClient } from '@/lib/supabase-server'

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('chat-tools executeTool', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // Helper: make a mock Supabase client that returns `members` from select
    function mockSupabaseWith(members: Member[], spouseCount = 0) {
        const memberQueryResult = { data: members, error: null }
        vi.mocked(createClient).mockResolvedValue({
            from: (table: string) => {
                if (table === 'spouses') {
                    return {
                        select: () => ({
                            count: 'exact' as const,
                            head: true as const,
                        }),
                        // Fake the count response
                        then: (resolve: (v: unknown) => void) =>
                            resolve({ count: spouseCount, error: null }),
                    } as any
                }
                return {
                    select: () => ({
                        order: () => ({
                            order: async () => memberQueryResult,
                        }),
                        ilike: () => ({
                            limit: async () => memberQueryResult,
                        }),
                        eq: () => ({
                            single: async () => ({ data: members[0] ?? null, error: null }),
                        }),
                    }),
                } as any
            },
            auth: { getUser: vi.fn() },
        } as any)
    }

    // ── get_all_members ───────────────────────────────────────────────────────

    describe('get_all_members', () => {
        it('returns list of members from DB', async () => {
            mockSupabaseWith(MEMBERS)
            // Since get_all_members calls createClient internally, we need a proper mock
            vi.mocked(createClient).mockResolvedValue({
                from: () => ({
                    select: () => ({
                        order: () => ({
                            order: async () => ({ data: MEMBERS, error: null }),
                        }),
                    }),
                }),
            } as any)

            const result = await executeTool('get_all_members', {})
            expect(Array.isArray(result)).toBe(true)
            expect((result as Member[]).length).toBe(4)
        })
    })

    // ── search_member ─────────────────────────────────────────────────────────

    describe('search_member', () => {
        it('filters members by query', async () => {
            vi.mocked(createClient).mockResolvedValue({
                from: () => ({
                    select: () => ({
                        ilike: () => ({
                            limit: async () => ({ data: [cha], error: null }),
                        }),
                    }),
                }),
            } as any)

            const result = await executeTool('search_member', { query: 'Cha' })
            expect(Array.isArray(result)).toBe(true)
            expect((result as Member[])[0].id).toBe('cha')
        })
    })

    // ── get_member_by_id ──────────────────────────────────────────────────────

    describe('get_member_by_id', () => {
        it('returns single member by id', async () => {
            vi.mocked(createClient).mockResolvedValue({
                from: () => ({
                    select: () => ({
                        eq: () => ({
                            single: async () => ({ data: ong, error: null }),
                        }),
                    }),
                }),
            } as any)

            const result = await executeTool('get_member_by_id', { id: 'ong' })
            expect((result as Member).full_name).toBe('Trần Văn Ông')
        })
    })

    // ── unknown tool ──────────────────────────────────────────────────────────

    describe('unknown tool', () => {
        it('returns error for unknown tool name', async () => {
            const result = await executeTool('not_a_tool', {}) as { error: string }
            expect(result.error).toContain('Unknown tool')
        })
    })
})

// ─── BFS Logic Tests (pure, no DB) ───────────────────────────────────────────
// We test the BFS / relationship description logic by extracting the behavior
// through the find_relationship tool with fully mocked data.

describe('find_relationship BFS Logic', () => {
    const SPOUSES = [
        { id: 'vo_ong', full_name: 'Bà Nội', member_id: 'ong', role_type: 'chinh_that' },
        { id: 'vo_cha', full_name: 'Mẹ Cha', member_id: 'cha', role_type: 'chinh_that' },
        { id: 'vo_con1', full_name: 'Vợ Con 1', member_id: 'con1', role_type: 'chinh_that' }
    ]

    beforeEach(() => {
        vi.clearAllMocks()
        // Mock supabase.from().select()
        vi.mocked(createClient).mockResolvedValue({
            from: (table: string) => ({
                select: () => {
                    const result = table === 'members' ? MEMBERS : SPOUSES
                    // We must return a thenable object that resolves to { data, error }
                    return Promise.resolve({ data: table === 'members' ? MEMBERS : SPOUSES, error: null })
                }
            }),
        } as any)
    })

    it('identifies direct parent-child relationship', async () => {
        const result = await executeTool('find_relationship', {
            person_name_1: 'Trần Văn Con1',
            person_name_2: 'Trần Văn Cha',
        }) as { description: string; path: unknown[] }

        expect(result.path.length).toBeGreaterThan(0)
        expect(result.description).toMatch(/cha/i)
    })

    it('identifies sibling relationship (same father)', async () => {
        const result = await executeTool('find_relationship', {
            person_name_1: 'Trần Văn Con1',
            person_name_2: 'Trần Thị Con2',
        }) as { description: string }

        expect(result.description).toMatch(/em/i)
    })

    it('identifies grandparent-grandchild relationship (2 generations)', async () => {
        const result = await executeTool('find_relationship', {
            person_name_1: 'Trần Văn Ông',
            person_name_2: 'Trần Văn Con1',
        }) as { description: string }

        expect(result.description).toMatch(/ông/i)
    })

    it('identifies relationship through spouse (e.g. Grandma -> Grandchild)', async () => {
        const result = await executeTool('find_relationship', {
            person_name_1: 'Bà Nội',
            person_name_2: 'Trần Văn Con1',
        }) as { description: string }

        // Mẹ Cha nối với Ông Nội, Ông Nội là cha của Cha, Cha là cha của Con1 => "gián tiếp... các bước"
        expect(result.description).toContain('gián tiếp')
        expect(result.description).toContain('Bà Nội là vợ của Trần Văn Ông')
        expect(result.description).toContain('Trần Văn Ông là cha/mẹ của Trần Văn Cha')
    })

    it('returns "not found" for member not in gia phả', async () => {
        const result = await executeTool('find_relationship', {
            person_name_1: 'Người Không Tồn Tại',
            person_name_2: 'Trần Văn Cha',
        }) as { description: string }

        expect(result.description).toContain('Không tìm thấy')
    })

    it('detects disconnected members (no path)', async () => {
        // Add stranger to mock data
        vi.mocked(createClient).mockResolvedValue({
            from: (table: string) => ({
                select: () => {
                    const res = table === 'members' ? [...MEMBERS, stranger] : SPOUSES
                    return Promise.resolve({ data: res, error: null })
                }
            }),
        } as any)

        const result = await executeTool('find_relationship', {
            person_name_1: 'Trần Văn Ông',
            person_name_2: 'Nguyễn Văn Lạ',
        }) as { relationship: string }

        expect(result.relationship).toBe('none')
    })

    it('handles same person being searched', async () => {
        const result = await executeTool('find_relationship', {
            person_name_1: 'Trần Văn Ông',
            person_name_2: 'Trần Văn Ông',
        }) as { relationship: string }

        expect(result.relationship).toBe('self')
    })
})
