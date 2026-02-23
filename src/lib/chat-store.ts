import { create } from 'zustand'

export interface ChatMessage {
    id: string
    role: 'user' | 'model'
    text: string
    timestamp: number
}

interface ChatState {
    messages: ChatMessage[]
    isOpen: boolean
    isLoading: boolean
    toggleChat: () => void
    sendMessage: (content: string) => Promise<void>
    clearMessages: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isOpen: false,
    isLoading: false,

    toggleChat: () => {
        const wasOpen = get().isOpen
        set({ isOpen: !wasOpen })

        // Auto-greet on first open
        if (!wasOpen && get().messages.length === 0) {
            set({
                messages: [{
                    id: 'greeting',
                    role: 'model',
                    text: 'Xin chào! Mei là trợ lý AI của Gia Phả Trần Tộc Mỹ Nguyên 🌸 Bạn muốn hỏi gì về dòng họ nhà mình nào? 😊',
                    timestamp: Date.now(),
                }],
            })
        }
    },

    sendMessage: async (content: string) => {
        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            text: content,
            timestamp: Date.now(),
        }

        set(state => ({
            messages: [...state.messages, userMsg],
            isLoading: true,
        }))

        try {
            // Prepare messages for API (exclude greeting if it's the auto-generated one)
            const allMessages = get().messages
            const apiMessages = allMessages.map(m => ({
                role: m.role,
                text: m.text,
            }))

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages }),
            })

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            const data = await res.json()
            const botMsg: ChatMessage = {
                id: `bot-${Date.now()}`,
                role: 'model',
                text: data.message || 'Mei xin lỗi, có lỗi xảy ra 😅',
                timestamp: Date.now(),
            }

            set(state => ({
                messages: [...state.messages, botMsg],
                isLoading: false,
            }))
        } catch {
            const errorMsg: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'model',
                text: 'Ui, Mei không kết nối được rồi 😢 Bạn thử lại sau nhé!',
                timestamp: Date.now(),
            }

            set(state => ({
                messages: [...state.messages, errorMsg],
                isLoading: false,
            }))
        }
    },

    clearMessages: () => set({ messages: [] }),
}))
