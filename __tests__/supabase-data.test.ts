/**
 * Unit tests for supabase-data.ts
 * Tests the CRUD operations with mocked Supabase client.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Member, Spouse } from '@/lib/types'

// Mock Supabase client (browser-side)
vi.mock('@/lib/supabase-client', () => ({
    createClient: vi.fn(),
}))

import {
    getAllMembers,
    getMemberById,
    searchMembers,
    createMember,
    updateMember,
    deleteMember,
    getAllSpouses,
    createSpouse,
    searchSpouses,
} from '@/lib/supabase-data'
import { createClient } from '@/lib/supabase-client'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const member1: Member = {
    id: 'a1', full_name: 'Trần Văn A', gender: 'male',
    generation_level: 1, father_id: null, mother_id: null,
    birth_order: 0, metadata: null, created_at: null, updated_at: null,
}
const member2: Member = {
    id: 'b2', full_name: 'Trần Thị B', gender: 'female',
    generation_level: 2, father_id: 'a1', mother_id: null,
    birth_order: 0, metadata: null, created_at: null, updated_at: null,
}
const spouse1: Spouse = {
    id: 's1', member_id: 'a1', full_name: 'Nguyễn Thị C',
    role_type: 'chinh_that', status: 'active',
    metadata: null, created_at: null, updated_at: null,
}

// ─── Helper: build mock Supabase chain ────────────────────────────────────────

function mockDb(overrides: Record<string, any> = {}) {
    const base = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: member1, error: null }),
        ...overrides,
    }
    vi.mocked(createClient).mockReturnValue(base as any)
    return base
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('supabase-data — Members CRUD', () => {

    beforeEach(() => vi.clearAllMocks())

    describe('getAllMembers', () => {
        it('returns all members ordered by generation and birth_order', async () => {
            // getAllMembers calls .select('*').order(...).order(...)
            // We need a thenable at the end of the double-order chain
            const thenableResult = { data: [member1, member2], error: null }
            const secondOrderChain = { ...thenableResult, then: (resolve: any) => Promise.resolve(thenableResult).then(resolve) }
            const firstOrderChain = { order: vi.fn().mockResolvedValue(thenableResult) }

            const db: any = {}
            db.from = vi.fn().mockReturnThis()
            db.select = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(firstOrderChain) })
            vi.mocked(createClient).mockReturnValue(db as any)

            const result = await getAllMembers()

            expect(result).toHaveLength(2)
            expect(result[0].id).toBe('a1')
        })

        it('throws when Supabase returns error', async () => {
            const errorResult = { data: null, error: { message: 'DB error' } }
            const firstOrderChain = { order: vi.fn().mockResolvedValue(errorResult) }

            const db: any = {}
            db.from = vi.fn().mockReturnThis()
            db.select = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(firstOrderChain) })
            vi.mocked(createClient).mockReturnValue(db as any)

            await expect(getAllMembers()).rejects.toMatchObject({ message: 'DB error' })
        })
    })

    describe('getMemberById', () => {
        it('returns member for valid id', async () => {
            const db = mockDb()
            db.single.mockResolvedValueOnce({ data: member1, error: null })

            const result = await getMemberById('a1')

            expect(result?.id).toBe('a1')
            expect(db.eq).toHaveBeenCalledWith('id', 'a1')
        })

        it('returns null when member not found', async () => {
            const db = mockDb()
            db.single.mockResolvedValueOnce({ data: null, error: null })

            const result = await getMemberById('nonexistent')
            expect(result).toBeNull()
        })
    })

    describe('searchMembers', () => {
        it('searches members by name using ilike', async () => {
            const db = mockDb()
            db.limit.mockResolvedValueOnce({ data: [member1], error: null })

            const result = await searchMembers('Trần')

            expect(result).toHaveLength(1)
            expect(db.ilike).toHaveBeenCalledWith('full_name', '%Trần%')
            expect(db.limit).toHaveBeenCalledWith(20)
        })

        it('returns empty array when no match', async () => {
            const db = mockDb()
            db.limit.mockResolvedValueOnce({ data: [], error: null })

            const result = await searchMembers('xyz_no_match')
            expect(result).toHaveLength(0)
        })
    })

    describe('createMember', () => {
        it('inserts member and returns created record', async () => {
            const db = mockDb()
            db.single.mockResolvedValueOnce({ data: member1, error: null })

            const newMember = { full_name: 'Trần Văn A', gender: 'male', generation_level: 1 }
            const result = await createMember(newMember as any)

            expect(result.id).toBe('a1')
            expect(db.insert).toHaveBeenCalled()
            // Should include updated_at in insert payload
            const insertArg = db.insert.mock.calls[0][0]
            expect(insertArg).toHaveProperty('updated_at')
        })
    })

    describe('updateMember', () => {
        it('updates member and returns updated record', async () => {
            const updated = { ...member1, full_name: 'Trần Văn A (Updated)' }
            const db = mockDb()
            db.single.mockResolvedValueOnce({ data: updated, error: null })

            const result = await updateMember('a1', { full_name: 'Trần Văn A (Updated)' })

            expect(result.full_name).toBe('Trần Văn A (Updated)')
            expect(db.update).toHaveBeenCalled()
            expect(db.eq).toHaveBeenCalledWith('id', 'a1')
        })
    })

    describe('deleteMember', () => {
        it('calls delete with correct id', async () => {
            const db = mockDb()
            db.eq.mockResolvedValueOnce({ error: null })

            await deleteMember('a1')

            expect(db.delete).toHaveBeenCalled()
            expect(db.eq).toHaveBeenCalledWith('id', 'a1')
        })

        it('throws when delete returns error', async () => {
            const db = mockDb()
            db.eq.mockResolvedValueOnce({ error: { message: 'Foreign key violation' } })

            await expect(deleteMember('a1')).rejects.toMatchObject({ message: 'Foreign key violation' })
        })
    })
})

describe('supabase-data — Spouses CRUD', () => {

    beforeEach(() => vi.clearAllMocks())

    describe('getAllSpouses', () => {
        it('returns all spouses ordered by created_at', async () => {
            const db = mockDb()
            db.order.mockResolvedValueOnce({ data: [spouse1], error: null })

            const result = await getAllSpouses()

            expect(result).toHaveLength(1)
            expect(result[0].member_id).toBe('a1')
            expect(db.from).toHaveBeenCalledWith('spouses')
        })
    })

    describe('createSpouse', () => {
        it('inserts spouse and returns created record', async () => {
            const db = mockDb()
            db.single.mockResolvedValueOnce({ data: spouse1, error: null })

            const newSpouse = { member_id: 'a1', full_name: 'Nguyễn Thị C' }
            const result = await createSpouse(newSpouse as any)

            expect(result.id).toBe('s1')
            expect(db.insert).toHaveBeenCalled()
        })
    })

    describe('searchSpouses', () => {
        it('searches spouses by name using ilike', async () => {
            const db = mockDb()
            db.limit.mockResolvedValueOnce({ data: [spouse1], error: null })

            const result = await searchSpouses('Nguyễn')

            expect(result).toHaveLength(1)
            expect(db.ilike).toHaveBeenCalledWith('full_name', '%Nguyễn%')
        })
    })
})
