'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PersonNode as PersonNodeType } from '@/lib/tree-layout'
import { MemberMetadata } from '@/lib/types'
import { cn } from '@/lib/utils'

function ProfileBlock({
    member,
}: {
    member: any;
}) {
    const meta = (member?.metadata as MemberMetadata) || {}
    const isMale = member?.gender === 'male'
    const isFemale = member?.gender === 'female'
    const isAlive = meta.is_alive !== false
    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join(' – ')

    return (
        <div className={cn(
            "flex flex-col items-center justify-center gap-2 px-3 py-4 w-[140px] group/profile transition-all duration-300",
            !isAlive && 'opacity-70'
        )}>
            {/* Avatar Circle with Gold Ring */}
            <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all duration-500 ring-2 ring-offset-2 ring-offset-[#1B0506]',
                'bg-[#0D0202] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)]',
                isMale ? 'ring-blue-400/40' : isFemale ? 'ring-pink-400/40' : 'ring-amber-500/30'
            )}>
                {meta.avatar_url
                    ? <img src={meta.avatar_url} alt={member.full_name} width={56} height={56} className="w-full h-full object-cover grayscale-[20%] group-hover/profile:grayscale-0 transition-all" />
                    : isMale ? '👨' : isFemale ? '👩' : '👤'
                }
            </div>

            <div className="flex flex-col items-center text-center mt-1">
                <h3 className="text-[12px] font-bold text-amber-200/90 leading-tight tracking-wide drop-shadow-sm uppercase font-serif line-clamp-2">
                    {member.full_name}
                </h3>

                {yearRange && (
                    <p className="text-[10px] text-amber-500/60 mt-1 font-medium tracking-widest">
                        {yearRange}
                    </p>
                )}

                <div className="mt-1 px-1.5 py-px rounded bg-white/5 border border-white/5">
                    <span className="text-[8px] text-amber-100/30 font-bold uppercase tracking-widest leading-none">
                        {isAlive ? 'Member' : 'Ancestor'}
                    </span>
                </div>
            </div>
        </div>
    )
}

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeType>) {
    const { member, spouses, isHighlighted } = data
    const isAlive = ((member.metadata as MemberMetadata)?.is_alive !== false)

    // Tạo danh sách kết hợp 1 người chồng + N người vợ
    const familyMembers = [member, ...(spouses || [])]

    return (
        <div className={cn(
            'rounded-lg border-[1.5px] transition-all duration-500 cursor-pointer group flex flex-col relative',
            'bg-[#1B0506] border-amber-600/30 shadow-[0_10px_40px_rgba(0,0,0,0.9)]',
            selected
                ? 'border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.4)] z-20 scale-[1.05] bg-[#2A0809]'
                : isHighlighted
                    ? 'border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-10 scale-[1.03]'
                    : 'hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
            !isAlive && spouses?.length === 0 && 'opacity-90'
        )}>
            {/* Ornamental Corners - Giống ảnh mẫu */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-amber-500/40 rounded-tl-[2px]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-amber-500/40 rounded-tr-[2px]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-amber-500/40 rounded-bl-[2px]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-amber-500/40 rounded-br-[2px]" />

            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-500 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Generation badge - Bo góc vuông chuẩn Chronicle */}
            <div className="absolute -top-3 left-3 z-10">
                <div className="text-[8px] font-black tracking-[0.2em] px-2 py-0.5 bg-[#F59E0B] text-[#1B0506] shadow-lg uppercase">
                    GEN {member.generation_level}
                </div>
            </div>

            <div className="flex flex-row items-center justify-start p-1.5 min-h-[64px]">
                {familyMembers.map((person, index) => (
                    <div key={person.id} className="flex flex-row items-center border-r border-amber-500/10 last:border-r-0">
                        <ProfileBlock member={person} />

                        {/* Ring separator between primary member and spouses */}
                        {index === 0 && familyMembers.length > 1 && (
                            <div className="w-1 h-12 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent mx-1" />
                        )}
                    </div>
                ))}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-500 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}

export const PersonNode = memo(PersonNodeComponent)
