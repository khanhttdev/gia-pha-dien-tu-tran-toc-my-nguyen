'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PersonNode as PersonNodeType } from '@/lib/tree-layout'
import { cn } from '@/lib/utils'

function PersonNodeComponent({ data, selected }: NodeProps<PersonNodeType>) {
    const { person, isHighlighted } = data
    const isMale = person.gender === 'male'
    const isFemale = person.gender === 'female'
    const yearRange = [person.birth_year, person.death_year].filter(Boolean).join(' – ')

    return (
        <div className={cn(
            'w-[180px] rounded-xl border transition-all duration-200 cursor-pointer group',
            'bg-card/95 backdrop-blur-sm shadow-md',
            selected
                ? 'border-amber-400 shadow-amber-400/30 shadow-lg ring-2 ring-amber-400/50'
                : isHighlighted
                    ? 'border-amber-300 shadow-amber-300/20 shadow-md'
                    : 'border-border hover:border-amber-400/50 hover:shadow-amber-400/10 hover:shadow-lg',
            !person.is_alive && 'opacity-70'
        )}>
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-amber-400 !border-amber-600" />

            {/* Generation badge */}
            <div className={cn(
                'absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center',
                isMale ? 'bg-blue-500/80 text-white' :
                    isFemale ? 'bg-rose-400/80 text-white' :
                        'bg-muted text-muted-foreground'
            )}>
                {person.generation}
            </div>

            <div className="p-3">
                {/* Avatar + Name */}
                <div className="flex items-center gap-2.5">
                    <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0',
                        'border shadow-inner',
                        isMale ? 'bg-blue-500/10 border-blue-500/30 text-blue-600' :
                            isFemale ? 'bg-rose-400/10 border-rose-400/30 text-rose-500' :
                                'bg-muted border-border'
                    )}>
                        {person.avatar_url
                            ? <img src={person.avatar_url} alt={person.full_name} className="w-full h-full object-cover rounded-lg" />
                            : isMale ? '👨' : isFemale ? '👩' : '👤'
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold leading-tight truncate text-foreground">
                            {person.full_name}
                        </p>
                        {yearRange && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                {yearRange}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status */}
                {!person.is_alive && (
                    <div className="mt-2 flex items-center gap-1">
                        <span className="text-[9px] text-muted-foreground/60 italic">đã mất</span>
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-amber-400 !border-amber-600" />
        </div>
    )
}

export const PersonNode = memo(PersonNodeComponent)
