'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Bell } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function PushNotificationPrompt() {
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) return
        if (Notification.permission !== 'default') return

        const dismissed = localStorage.getItem('push-notification-dismissed')
        if (dismissed) return

        // Delay showing this modal
        const timer = setTimeout(() => setShowModal(true), 6000)
        return () => clearTimeout(timer)
    }, [])

    const handleEnable = async () => {
        setLoading(true)
        try {
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setShowModal(false)
                setLoading(false)
                return
            }

            // Register service worker if not already
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready

            // Get VAPID public key from env
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidKey) {
                console.warn('VAPID public key not configured')
                setShowModal(false)
                setLoading(false)
                return
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            })

            const subJson = subscription.toJSON()

            // Save to Supabase
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                await supabase.from('push_subscriptions').upsert({
                    user_id: user.id,
                    endpoint: subJson.endpoint!,
                    p256dh: subJson.keys!.p256dh,
                    auth_key: subJson.keys!.auth,
                }, { onConflict: 'endpoint' })
            }

            setShowModal(false)
        } catch (err) {
            console.error('Push subscription error:', err)
        }
        setLoading(false)
    }

    const handleDismiss = () => {
        localStorage.setItem('push-notification-dismissed', 'true')
        setShowModal(false)
    }

    return (
        <ConfirmModal
            open={showModal}
            onOpenChange={setShowModal}
            variant="info"
            title="Bật thông báo"
            description="Nhận thông báo khi có tin mới từ dòng họ: lịch giỗ, sự kiện, bảng tin mới, bình luận,..."
            confirmText="Bật thông báo"
            cancelText="Để sau"
            onConfirm={handleEnable}
            onCancel={handleDismiss}
            loading={loading}
        >
            <div className="flex justify-center py-2">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-lg">
                    <Bell className="w-8 h-8 text-blue-400" />
                </div>
            </div>
        </ConfirmModal>
    )
}
