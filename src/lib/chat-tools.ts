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

interface GraphNode {
    id: string
    name: string
    generation: number | null
    gender: string | null
    type: 'member' | 'spouse'
    father_id?: string | null
    spouse_of?: string | null
    role_type?: string | null
}

interface RelationshipResult {
    person1: string
    person2: string
    path: Array<{ id: string; name: string; generation: number | null }>
    relationship: string
    description: string
}

function describePath(path: GraphNode[]): string {
    if (path.length < 2) return 'Cùng một người'

    // If purely members and short enough, we can use old static logic, but unified step-by-step is better for complex
    const isPureMembers = path.every(n => n.type === 'member')

    if (isPureMembers) {
        const p1 = path[0]
        const p2 = path[path.length - 1]

        // Direct parent-child
        if (p1.father_id === p2.id) return p2.gender === 'male' ? `${p2.name} là **cha** của ${p1.name}` : `${p2.name} là **mẹ** của ${p1.name}`
        if (p2.father_id === p1.id) return p1.gender === 'male' ? `${p1.name} là **cha** của ${p2.name}` : `${p1.name} là **mẹ** của ${p2.name}`

        // Siblings
        if (p1.father_id && p1.father_id === p2.father_id) return `${p1.name} và ${p2.name} là **anh/chị em** ruột`

        // generation gap
        const genGap = Math.abs((p1.generation ?? 1) - (p2.generation ?? 1))
        const elder = (p1.generation ?? 1) < (p2.generation ?? 1) ? p1 : p2
        const younger = (p1.generation ?? 1) < (p2.generation ?? 1) ? p2 : p1

        if (genGap === 2) return elder.gender === 'male' ? `${elder.name} là **ông** của ${younger.name}` : `${elder.name} là **bà** của ${younger.name}`
        if (genGap === 3) return elder.gender === 'male' ? `${elder.name} là **cụ ông** của ${younger.name}` : `${elder.name} là **cụ bà** của ${younger.name}`
        if (genGap === 0) return `${p1.name} và ${p2.name} là **anh/chị em họ** (cùng thế hệ F${p1.generation})`
        if (genGap === 1) return elder.gender === 'male' ? `${elder.name} là **chú/bác** của ${younger.name}` : `${elder.name} là **cô/dì** của ${younger.name}`
    }

    // Direct spouse
    if (path.length === 2 && path.some(n => n.type === 'spouse')) {
        const p1 = path[0]
        const p2 = path[1]
        if (p1.spouse_of === p2.id) {
            return p1.role_type === 'chong' ? `${p1.name} là **chồng** của ${p2.name}` : `${p1.name} là **vợ** của ${p2.name}`
        }
        if (p2.spouse_of === p1.id) {
            return p2.role_type === 'chong' ? `${p2.name} là **chồng** của ${p1.name}` : `${p2.name} là **vợ** của ${p1.name}`
        }
    }

    // Step-by-step description for complex mixed paths
    const steps: string[] = []
    for (let i = 0; i < path.length - 1; i++) {
        const a = path[i]
        const b = path[i + 1]
        let stepDesc = ''

        if (a.father_id === b.id) stepDesc = `${b.name} là cha/mẹ của ${a.name}`
        else if (b.father_id === a.id) stepDesc = `${a.name} là cha/mẹ của ${b.name}`
        else if (a.spouse_of === b.id) stepDesc = `${a.name} là ${a.role_type === 'chong' ? 'chồng' : 'vợ'} của ${b.name}`
        else if (b.spouse_of === a.id) stepDesc = `${b.name} là ${b.role_type === 'chong' ? 'chồng' : 'vợ'} của ${a.name}`
        else stepDesc = `${a.name} nối với ${b.name}`

        steps.push(stepDesc)
    }

    return `Quan hệ gián tiếp thông qua ${path.length - 2} người nối trung gian. Các bước:\n` + steps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n')
}

async function findRelationship(name1: string, name2: string): Promise<RelationshipResult> {
    const supabase = await createClient()
    const [membersRes, spousesRes] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('spouses').select('*'),
    ])

    const members = membersRes.data || []
    const spouses = spousesRes.data || []

    const nodes: GraphNode[] = [
        ...members.map(m => ({
            id: m.id, name: m.full_name, generation: m.generation_level,
            gender: m.gender, type: 'member' as const, father_id: m.father_id
        })),
        ...spouses.map(s => ({
            id: s.id, name: s.full_name, generation: null,
            gender: s.role_type === 'chong' ? 'male' : 'female', type: 'spouse' as const,
            spouse_of: s.member_id, role_type: s.role_type
        })),
    ]

    const byId = new Map(nodes.map(n => [n.id, n]))

    // Find both people by name
    const p1 = nodes.find(n => n.name.toLowerCase().includes(name1.toLowerCase()))
    const p2 = nodes.find(n => n.name.toLowerCase().includes(name2.toLowerCase()))

    if (!p1) return { person1: name1, person2: name2, path: [], relationship: 'unknown', description: `Không tìm thấy "${name1}" trong gia phả` }
    if (!p2) return { person1: name1, person2: name2, path: [], relationship: 'unknown', description: `Không tìm thấy "${name2}" trong gia phả` }
    if (p1.id === p2.id) return { person1: name1, person2: name2, path: [{ id: p1.id, name: p1.name, generation: p1.generation }], relationship: 'self', description: 'Đó là cùng một người' }

    // Build adjacency list
    const adj = new Map<string, string[]>()
    for (const n of nodes) {
        if (!adj.has(n.id)) adj.set(n.id, [])
        if (n.type === 'member' && n.father_id && byId.has(n.father_id)) {
            adj.get(n.id)!.push(n.father_id)
            if (!adj.has(n.father_id)) adj.set(n.father_id, [])
            adj.get(n.father_id)!.push(n.id)
        }
        if (n.type === 'spouse' && n.spouse_of && byId.has(n.spouse_of)) {
            adj.get(n.id)!.push(n.spouse_of)
            if (!adj.has(n.spouse_of)) adj.set(n.spouse_of, [])
            adj.get(n.spouse_of)!.push(n.id)
        }
    }

    // BFS
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
            person1: p1.name,
            person2: p2.name,
            path: [],
            relationship: 'none',
            description: `Không tìm thấy đường nối giữa ${p1.name} và ${p2.name} trong gia phả`,
        }
    }

    // Reconstruct path
    const pathIds: string[] = []
    let cur: string | null = p2.id
    while (cur !== null) {
        pathIds.unshift(cur)
        cur = parent.get(cur) ?? null
    }

    const pathNodes = pathIds.map(id => byId.get(id)!).filter(Boolean)
    const description = describePath(pathNodes)

    return {
        person1: p1.name,
        person2: p2.name,
        path: pathNodes.map(n => ({ id: n.id, name: n.name, generation: n.generation })),
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
