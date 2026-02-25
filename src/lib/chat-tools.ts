import { createClient } from '@/lib/supabase-server'
import { Member, MemberMetadata } from './types'
import { Type, FunctionDeclaration } from '@google/genai'

// ─── Tool Declarations for Gemini Function Calling ─────────────────────────

export const toolDeclarations: FunctionDeclaration[] = [
    {
        name: 'get_all_members',
        description: 'Lấy danh sách toàn bộ thành viên huyết thống trong gia phả Trần Tộc Mỹ Nguyên. Dùng khi cần tổng quan hoặc tìm quan hệ.',
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
        description: 'Lấy thống kê tổng quan gia phả: tổng thành viên, số còn sống, số thế hệ, số phối ngẫu.',
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

// ─── Metadata Helpers ──────────────────────────────────────────────────────

function getMeta(member: Member): MemberMetadata {
    return (member.metadata as MemberMetadata) || {}
}

// ─── Tool Executors ────────────────────────────────────────────────────────

async function getAllMembers(): Promise<Member[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('generation_level', { ascending: true })
        .order('birth_order', { ascending: true })

    if (error) throw error
    return data as Member[]
}

async function searchMember(query: string): Promise<Member[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .ilike('full_name', `%${query}%`)
        .limit(20)

    if (error) throw error
    return data as Member[]
}

async function getMemberById(id: string): Promise<Member | null> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()

    return data as Member | null
}

async function getFamilyStatistics() {
    const supabase = await createClient()
    const members = await getAllMembers()
    const { count: spouseCount } = await supabase
        .from('spouses')
        .select('*', { count: 'exact', head: true })

    const alive = members.filter(m => getMeta(m).is_alive !== false).length
    const generations = new Set(members.map(m => m.generation_level)).size

    return {
        total_members: members.length,
        total_spouses: spouseCount ?? 0,
        alive,
        deceased: members.length - alive,
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

function describeRelationship(path: Member[], person1: Member, person2: Member): string {
    if (path.length < 2) return 'Cùng một người'

    // Direct parent-child (father_id only in members)
    if (person1.father_id === person2.id) {
        return person2.gender === 'male'
            ? `${person2.full_name} là **cha** của ${person1.full_name}`
            : `${person2.full_name} là **mẹ** của ${person1.full_name}`
    }
    if (person2.father_id === person1.id) {
        return person1.gender === 'male'
            ? `${person1.full_name} là **cha** của ${person2.full_name}`
            : `${person1.full_name} là **mẹ** của ${person2.full_name}`
    }

    // Siblings (same father)
    if (person1.father_id && person1.father_id === person2.father_id) {
        return `${person1.full_name} và ${person2.full_name} là **anh/chị em** ruột`
    }

    // Grandparent-grandchild & beyond — use generation gap
    const genGap = Math.abs((person1.generation_level ?? 1) - (person2.generation_level ?? 1))
    const elder = (person1.generation_level ?? 1) < (person2.generation_level ?? 1) ? person1 : person2
    const younger = (person1.generation_level ?? 1) < (person2.generation_level ?? 1) ? person2 : person1

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
        return `${person1.full_name} và ${person2.full_name} là **anh/chị em họ** (cùng thế hệ F${person1.generation_level})`
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
    const members = await getAllMembers()
    const byId = new Map(members.map(m => [m.id, m]))

    // Find both people by name
    const p1 = members.find(m => m.full_name.toLowerCase().includes(name1.toLowerCase()))
    const p2 = members.find(m => m.full_name.toLowerCase().includes(name2.toLowerCase()))

    if (!p1) return { person1: name1, person2: name2, path: [], relationship: 'unknown', description: `Không tìm thấy "${name1}" trong gia phả` }
    if (!p2) return { person1: name1, person2: name2, path: [], relationship: 'unknown', description: `Không tìm thấy "${name2}" trong gia phả` }
    if (p1.id === p2.id) return { person1: name1, person2: name2, path: [{ id: p1.id, name: p1.full_name, generation: p1.generation_level }], relationship: 'self', description: 'Đó là cùng một người' }

    // Build adjacency list (undirected: parent↔child via father_id)
    const adj = new Map<string, string[]>()
    for (const m of members) {
        if (!adj.has(m.id)) adj.set(m.id, [])
        if (m.father_id && byId.has(m.father_id)) {
            adj.get(m.id)!.push(m.father_id)
            if (!adj.has(m.father_id)) adj.set(m.father_id, [])
            adj.get(m.father_id)!.push(m.id)
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

    const pathMembers = pathIds.map(id => byId.get(id)!).filter(Boolean)
    const description = describeRelationship(pathMembers, p1, p2)

    return {
        person1: p1.full_name,
        person2: p2.full_name,
        path: pathMembers.map(m => ({ id: m.id, name: m.full_name, generation: m.generation_level })),
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
