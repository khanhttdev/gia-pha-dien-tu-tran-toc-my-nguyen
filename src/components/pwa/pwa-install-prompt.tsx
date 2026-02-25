'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) return

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setTimeout(() => setShowPrompt(true), 3000)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const dismiss = (persist = false) => {
        setIsExiting(true)
        if (persist) localStorage.setItem('pwa-install-dismissed', 'true')
        setTimeout(() => {
            setShowPrompt(false)
            setIsExiting(false)
        }, 300)
    }

    const handleInstall = async () => {
        if (!deferredPrompt) return
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') dismiss(true)
        setDeferredPrompt(null)
    }

    if (!deferredPrompt || !showPrompt) return null

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] sm:w-[360px] rounded-2xl border border-amber-500/20 bg-background/90 backdrop-blur-xl shadow-2xl shadow-black/20 p-4 transition-all duration-300 ${isExiting
                ? 'translate-y-4 opacity-0'
                : 'animate-in slide-in-from-bottom-4 fade-in-0 duration-500'
                }`}
            role="dialog"
            aria-label="Cài đặt ứng dụng"
        >
            <button
                onClick={() => dismiss(true)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Đóng"
            >
                <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-lg shrink-0">
                    <Download className="w-6 h-6 text-amber-900" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold leading-tight">Cài đặt ứng dụng</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Truy cập nhanh Gia Phả Trần Tộc như ứng dụng thực thụ trên thiết bị!
                    </p>
                </div>
            </div>
            <div className="flex gap-2 mt-3">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => dismiss(true)}
                >
                    Để sau
                </Button>
                <Button
                    size="sm"
                    className="flex-1 h-9 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-md shadow-amber-500/20"
                    onClick={handleInstall}
                >
                    <Download className="w-3.5 h-3.5" />
                    Cài đặt ngay
                </Button>
            </div>
        </div>
    )
}
