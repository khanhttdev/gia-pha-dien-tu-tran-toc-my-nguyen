'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PersonNode as PersonNodeType } from '@/lib/tree-layout'
import { MemberMetadata } from '@/lib/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'

function ProfileBlock({
    member,
    isSpouse = false
}: {
    member: any;
    isSpouse?: boolean;
}) {
    const meta = (member?.metadata as MemberMetadata) || {}
    const isMale = member?.gender === 'male'
    const isFemale = member?.gender === 'female'
    const isAlive = meta.is_alive !== false
    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join(' – ')

    return (
        <div className={cn("flex flex-col items-center", !isAlive && 'opacity-75 grayscale-[20%]')}>
            <div className={cn(
                'w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl mb-2 shrink-0 transition-transform group-hover:scale-110 duration-500',
                'bg-white/5 border border-white/10 shadow-inner overflow-hidden',
                isMale ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                    isFemale ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                        'text-amber-400 bg-amber-500/10 border-amber-500/30'
            )}>
                {meta.avatar_url
                    ? <img src={meta.avatar_url} alt={member.full_name} width={56} height={56} className="w-full h-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
                    : isMale ? '👨' : isFemale ? '👩' : '👤'
                }
            </div>

            <h3 className="text-[10px] md:text-xs font-bold text-white mb-0.5 leading-tight tracking-wide px-1 text-center line-clamp-2 max-w-[100px]">
                {member.full_name}
            </h3>

            {yearRange && (
                <p className="text-[9px] text-white/50 leading-relaxed font-medium">
                    {yearRange}
                </p>
            )}

            {!isAlive && (
                <span className="text-[8px] text-white/30 italic mt-0.5">đã mất</span>
            )}
        </div>
    )
}

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeType>) {
    const { member, spouse, isHighlighted } = data
    const isAlive = ((member.metadata as MemberMetadata)?.is_alive !== false)

    return (
        <div className={cn(
            'min-w-[140px] rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center p-3 md:p-4 relative',
            'bg-white/[0.04] backdrop-blur-md shadow-xl',
            selected
                ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/50 scale-105 z-10'
                : isHighlighted
                    ? 'border-amber-400/50 shadow-md scale-105 z-10'
                    : 'border-white/10 hover:bg-white/10 hover:border-white/20',
            !isAlive && !spouse && 'opacity-75 grayscale-[20%]'
        )}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-400 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Generation badge */}
            <div className="absolute top-2 right-2 md:top-3 md:right-3">
                <div className="text-[8px] md:text-[9px] font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                    F{member.generation_level}
                </div>
            </div>

            <div className="flex items-start gap-4 md:gap-6 w-full justify-center">
                <ProfileBlock member={member} />

                {spouse && (
                    <>
                        <div className="relative flex items-center justify-center shrink-0 self-center -mx-2 md:-mx-3 z-10 w-6 h-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
                            <span className="text-[10px]">💍</span>
                        </div>
                        <ProfileBlock member={spouse} isSpouse={true} />
                    </>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-400 !border-transparent !rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    )
}

export const PersonNode = memo(PersonNodeComponent)
