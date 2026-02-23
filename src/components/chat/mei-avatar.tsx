'use client'

import { cn } from '@/lib/utils'

interface MeiAvatarProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    pulse?: boolean
}

const sizeMap = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-14 h-14 text-3xl',
}

export function MeiAvatar({ size = 'md', className, pulse }: MeiAvatarProps) {
    return (
        <div className={cn(
            'rounded-full flex items-center justify-center shrink-0',
            'bg-gradient-to-br from-rose-400/80 to-amber-400/80',
            'shadow-lg border border-white/20',
            sizeMap[size],
            pulse && 'animate-pulse',
            className,
        )}>
            <span role="img" aria-label="Mei Trần">🌸</span>
        </div>
    )
}
