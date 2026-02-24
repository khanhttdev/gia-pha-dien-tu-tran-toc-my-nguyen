import { createClient } from '@/lib/supabase-server'
import { Person } from './types'
import { Type, FunctionDeclaration } from '@google/genai'

// ─── Tool Declarations for Gemini Function Calling ─────────────────────────

export const toolDeclarations: FunctionDeclaration[] = [
    {
        name: 'get_all_members',
        description: 'Lấy danh sách toàn bộ thành viên trong gia phả Trần Tộc Mỹ Nguyên. Dùng khi cần tổng quan hoặc tìm quan hệ.',
        parameters: {
            type: Type.OBJECT,
            properties: {},
            required: [],
        },
    },
    {
        name: 'search_member',
        description: 'Tìm kiếm thành viên theo tên (hoặc một phần tên). Trả về danh sách người khớp.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: {
                    type: Type.STRING,
                    description: 'Tên hoặc một phần tên cần tìm',
                },
            },
            required: ['query'],
        },
    },
    {
        name: 'get_member_by_id',
        description: 'Lấy thông tin chi tiết của một thành viên theo ID.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                id: {
                    type: Type.STRING,
                    description: 'UUID của thành viên',
                },
            },
            required: ['id'],
        },
    },
    {
        name: 'get_family_statistics',
        description: 'Lấy thống kê tổng quan gia phả: tổng thành viên, số còn sống, số thế hệ.',
        parameters: {
            type: Type.OBJECT,
            properties: {},
            required: [],
        },
    },
    {
        name: 'find_relationship',
        description: 'Tìm mối quan hệ giữa 2 thành viên. Sử dụng tên đầy đủ. Trả về đường đi và mô tả quan hệ.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                person_name_1: {
                    type: Type.STRING,
                    description: 'Tên đầy đủ của người thứ nhất',
                },
                person_name_2: {
                    type: Type.STRING,
                    description: 'Tên đầy đủ của người thứ hai',
                },
            },
            required: ['person_name_1', 'person_name_2'],
        },
    },
]

// ─── Tool Executors ────────────────────────────────────────────────────────

async function getAllMembers(): Promise<Person[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('people')
        .select('*')
        .order('generation', { ascending: true })
        .order('sort_order', { ascending: true })

    if (error) throw error
    return data as Person[]
}

async function searchMember(query: string): Promise<Person[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('people')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .limit(20)

    if (error) throw error
    return data as Person[]
}

async function getMemberById(id: string): Promise<Person | null> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('people')
        .select('*')
        .eq('id', id)
        .single()

    return data as Person | null
}

async function getFamilyStatistics() {
    const people = await getAllMembers()
    const alive = people.filter(p => p.is_alive).length
    const generations = new Set(people.map(p => p.generation)).size

    return {
        total: people.length,
        alive,
        deceased: people.length - alive,
        generations,
    }
}

// ─── BFS Relationship Finder ───────────────────────────────────────────────

interface RelationshipResult {
    person1: string
    person2: string
    path: Array<{ id: string; name: string; generation: number | null }>
    relationship: string
    description: string
}

function describeRelationship(path: Person[], person1: Person, person2: Person): string {
    if (path.length < 2) return 'Cùng một người'

    // Direct parent-child
    if (person1.father_id === person2.id || person1.mother_id === person2.id) {
        return person2.gender === 'male'
            ? `${person2.full_name} là **cha** của ${person1.full_name}`
            : `${person2.full_name} là **mẹ** của ${person1.full_name}`
    }
    if (person2.father_id === person1.id || person2.mother_id === person1.id) {
        return person1.gender === 'male'
            ? `${person1.full_name} là **cha** của ${person2.full_name}`
            : `${person1.full_name} là **mẹ** của ${person2.full_name}`
    }

    // Siblings
    if (
        person1.father_id && person1.father_id === person2.father_id ||
        person1.mother_id && person1.mother_id === person2.mother_id
    ) {
        return `${person1.full_name} và ${person2.full_name} là **anh/chị em** ruột`
    }

    // Grandparent-grandchild & beyond — use generation gap
    const genGap = Math.abs((person1.generation ?? 1) - (person2.generation ?? 1))
    const elder = (person1.generation ?? 1) < (person2.generation ?? 1) ? person1 : person2
    const younger = (person1.generation ?? 1) < (person2.generation ?? 1) ? person2 : person1

    if (genGap === 2) {
        return elder.gender === 'male'
            ? `${elder.full_name} là **ông nội/ngoại** của ${younger.full_name}`
            : `${elder.full_name} là **bà nội/ngoại** của ${younger.full_name}`
    }

    if (genGap === 3) {
        return elder.gender === 'male'
            ? `${elder.full_name} là **cụ ông** của ${younger.full_name}`
            : `${elder.full_name} là **cụ bà** của ${younger.full_name}`
    }

    // Same generation but not siblings — cousins
    if (genGap === 0) {
        return `${person1.full_name} và ${person2.full_name} là **anh/chị em họ** (cùng thế hệ F${person1.generation})`
    }

    // Uncle/Aunt relationship (gap = 1, not parent-child)
    if (genGap === 1) {
        return elder.gender === 'male'
            ? `${elder.full_name} là **chú/bác** của ${younger.full_name}`
            : `${elder.full_name} là **cô/dì** của ${younger.full_name}`
    }

    return `${person1.full_name} và ${person2.full_name} cách nhau ${genGap} thế hệ trong gia phả`
}

async function findRelationship(name1: string, name2: string): Promise<RelationshipResult> {
    const people = await getAllMembers()
    const byId = new Map(people.map(p => [p.id, p]))

    // Find both people by name
    const p1 = people.find(p => p.full_name.toLowerCase().includes(name1.toLowerCase()))
    const p2 = people.find(p => p.full_name.toLowerCase().includes(name2.toLowerCase()))

    if (!p1) return { person1: name1, person2: name2, path: [], relationship: 'unknown', description: `Không tìm thấy "${name1}" trong gia phả` }
    if (!p2) return { person1: name1, person2: name2, path: [], relationship: 'unknown', description: `Không tìm thấy "${name2}" trong gia phả` }
    if (p1.id === p2.id) return { person1: name1, person2: name2, path: [{ id: p1.id, name: p1.full_name, generation: p1.generation }], relationship: 'self', description: 'Đó là cùng một người' }

    // Build adjacency list (undirected: parent↔child)
    const adj = new Map<string, string[]>()
    for (const p of people) {
        if (!adj.has(p.id)) adj.set(p.id, [])
        if (p.father_id && byId.has(p.father_id)) {
            adj.get(p.id)!.push(p.father_id)
            if (!adj.has(p.father_id)) adj.set(p.father_id, [])
            adj.get(p.father_id)!.push(p.id)
        }
        if (p.mother_id && byId.has(p.mother_id)) {
            adj.get(p.id)!.push(p.mother_id)
            if (!adj.has(p.mother_id)) adj.set(p.mother_id, [])
            adj.get(p.mother_id)!.push(p.id)
        }
    }

    // BFS from p1 to p2
    const visited = new Set<string>()
    const parent = new Map<string, string | null>()
    const queue: string[] = [p1.id]
    visited.add(p1.id)
    parent.set(p1.id, null)

    while (queue.length > 0) {
        const curr = queue.shift()!
        if (curr === p2.id) break
        for (const neighbor of adj.get(curr) ?? []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor)
                parent.set(neighbor, curr)
                queue.push(neighbor)
            }
        }
    }

    if (!visited.has(p2.id)) {
        return {
            person1: p1.full_name,
            person2: p2.full_name,
            path: [],
            relationship: 'none',
            description: `Không tìm thấy đường nối giữa ${p1.full_name} và ${p2.full_name} trong gia phả`,
        }
    }

    // Reconstruct path
    const pathIds: string[] = []
    let cur: string | null = p2.id
    while (cur !== null) {
        pathIds.unshift(cur)
        cur = parent.get(cur) ?? null
    }

    const pathPersons = pathIds.map(id => byId.get(id)!).filter(Boolean)
    const description = describeRelationship(pathPersons, p1, p2)

    return {
        person1: p1.full_name,
        person2: p2.full_name,
        path: pathPersons.map(p => ({ id: p.id, name: p.full_name, generation: p.generation })),
        relationship: description,
        description,
    }
}

// ─── Tool Router ───────────────────────────────────────────────────────────

 
export async function executeTool(name: string, args: Record<string, any>): Promise<unknown> {
    switch (name) {
        case 'get_all_members':
            return await getAllMembers()
        case 'search_member':
            return await searchMember(args.query)
        case 'get_member_by_id':
            return await getMemberById(args.id)
        case 'get_family_statistics':
            return await getFamilyStatistics()
        case 'find_relationship':
            return await findRelationship(args.person_name_1, args.person_name_2)
        default:
            return { error: `Unknown tool: ${name}` }
    }
}
