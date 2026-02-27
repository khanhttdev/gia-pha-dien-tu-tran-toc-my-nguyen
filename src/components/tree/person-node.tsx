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
        <div className={cn("flex flex-col items-center w-[110px] text-center", !isAlive && 'opacity-70 grayscale-[30%]')}>
            <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 duration-500 ring-2 ring-offset-2 ring-offset-[#31090A]',
                'bg-[#1B0506] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]',
                isMale ? 'ring-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]' :
                    isFemale ? 'ring-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.3)]' :
                        'ring-amber-200/50'
            )}>
                {meta.avatar_url
                    ? <img src={meta.avatar_url} alt={member.full_name} width={56} height={56} className="w-full h-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
                    : isMale ? '👨' : isFemale ? '👩' : '👤'
                }
            </div>

            <div className="mt-2.5 flex flex-col items-center">
                <h3 className="text-[11px] font-bold text-amber-50 leading-tight tracking-tight line-clamp-2 px-1 drop-shadow-sm">
                    {member.full_name}
                </h3>

                {yearRange && (
                    <p className="text-[9px] text-amber-500/90 mt-0.5 font-bold">
                        {yearRange}
                    </p>
                )}

                {!isAlive && (
                    <span className="text-[8px] text-amber-200/40 uppercase tracking-tighter mt-0.5 font-black">đã mất</span>
                )}
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
            'rounded-2xl border-2 transition-all duration-500 cursor-pointer group flex flex-col p-4 relative',
            'bg-[#31090A] border-amber-600/40 shadow-[0_8px_30px_rgba(0,0,0,0.8)]',
            selected
                ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] z-20 scale-[1.05] bg-[#4A0D0E]'
                : isHighlighted
                    ? 'border-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.3)] z-10 scale-[1.03]'
                    : 'hover:border-amber-500/60 hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
            !isAlive && spouses?.length === 0 && 'opacity-90'
        )}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-500 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Generation badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="text-[10px] font-black tracking-[0.2em] px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 text-[#31090A] border border-amber-200/30 shadow-[0_2px_10px_rgba(0,0,0,0.5)] uppercase">
                    Đời {member.generation_level}
                </div>
            </div>

            <div className="flex flex-row items-center justify-center pt-2">
                {familyMembers.map((person, index) => (
                    <div key={person.id} className="flex flex-row items-center">
                        <ProfileBlock member={person} />

                        {/* Nhẫn cưới vàng giữa cặp đôi */}
                        {index < familyMembers.length - 1 && (
                            <div className="w-8 shrink-0 flex items-center justify-center -mt-6">
                                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-[0_2px_8px_rgba(251,191,36,0.4)] ring-2 ring-[#31090A] z-10 transform hover:rotate-12 transition-transform">
                                    <span className="text-[12px] filter drop-shadow-md">💍</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-500 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}

export const PersonNode = memo(PersonNodeComponent)
