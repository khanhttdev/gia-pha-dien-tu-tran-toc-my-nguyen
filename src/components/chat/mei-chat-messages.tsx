'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/lib/chat-store'
import { MeiAvatar } from './mei-avatar'
import { cn } from '@/lib/utils'

interface Props {
    messages: ChatMessage[]
    isLoading: boolean
}

export function MeiChatMessages({ messages, isLoading }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
        })
    }, [messages, isLoading])

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
                <div
                    key={msg.id}
                    className={cn(
                        'flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300',
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                >
                    {msg.role === 'model' && <MeiAvatar size="sm" />}

                    <div className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                            ? 'bg-amber-500/90 text-black font-medium rounded-br-md'
                            : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-md'
                    )}>
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                </div>
            ))}

            {isLoading && (
                <div className="flex gap-2.5 animate-in fade-in duration-300">
                    <MeiAvatar size="sm" pulse />
                    <div className="bg-white/10 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1.5">
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
