'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PersonNode as PersonNodeType } from '@/lib/tree-layout'
import { MemberMetadata } from '@/lib/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeType>) {
    const { member, spouse, isHighlighted } = data
    const meta = (member.metadata as MemberMetadata) || {}
    const isMale = member.gender === 'male'
    const isFemale = member.gender === 'female'
    const isAlive = meta.is_alive !== false

    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join(' – ')

    return (
        <div className={cn(
            'w-[160px] min-h-[120px] rounded-[20px] border transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center p-4 relative',
            'bg-white/[0.04] backdrop-blur-md shadow-xl',
            selected
                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50 scale-105'
                : isHighlighted
                    ? 'border-amber-400/50 shadow-md scale-105'
                    : 'border-white/10 hover:bg-white/10 hover:border-white/20',
            !isAlive && 'opacity-75 grayscale-[20%]'
        )}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-400 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Generation badge */}
            <div className="absolute top-2 right-2">
                <div className="text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                    F{member.generation_level}
                </div>
            </div>

            {/* Icon Box */}
            <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 shrink-0 transition-transform group-hover:scale-110 duration-500',
                'bg-white/5 border border-white/10 shadow-inner',
                isMale ? 'text-blue-400' :
                    isFemale ? 'text-rose-400' :
                        'text-amber-400'
            )}>
                {meta.avatar_url
                    ? <Image src={meta.avatar_url} alt={member.full_name} width={40} height={40} className="w-full h-full object-cover rounded-xl" />
                    : isMale ? '👨' : isFemale ? '👩' : '👤'
                }
            </div>

            {/* Name */}
            <h3 className="text-xs font-bold text-white mb-1 leading-tight tracking-wide px-1">
                {member.full_name}
            </h3>

            {/* Spouse name */}
            {spouse && (
                <p className="text-[10px] text-rose-300/70 mb-0.5">
                    💍 {spouse.full_name}
                </p>
            )}

            {/* Year range */}
            {yearRange && (
                <p className="text-[10px] text-white/50 leading-relaxed font-medium">
                    {yearRange}
                </p>
            )}

            {!isAlive && (
                <span className="text-[9px] text-white/30 italic mt-1.5">đã mất</span>
            )}

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-400 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}

export const PersonNode = memo(PersonNodeComponent)
