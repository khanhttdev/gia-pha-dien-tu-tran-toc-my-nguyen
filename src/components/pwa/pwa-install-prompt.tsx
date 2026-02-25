'use client'

import { useState, useEffect } from 'react'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) return

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // Delay showing modal so it doesn't pop up immediately
            setTimeout(() => setShowModal(true), 3000)
        }

        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setShowModal(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        localStorage.setItem('pwa-install-dismissed', 'true')
        setShowModal(false)
    }

    if (!deferredPrompt) return null

    return (
        <ConfirmModal
            open={showModal}
            onOpenChange={setShowModal}
            variant="info"
            title="Cài đặt ứng dụng"
            description="Bạn có muốn cài đặt Gia Phả Trần Tộc lên thiết bị? Truy cập nhanh hơn như một ứng dụng thực thụ!"
            confirmText="Cài đặt ngay"
            cancelText="Để sau"
            onConfirm={handleInstall}
            onCancel={handleDismiss}
        >
            <div className="flex justify-center py-2">
                <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                    <Download className="w-8 h-8 text-amber-900" />
                </div>
            </div>
        </ConfirmModal>
    )
}
