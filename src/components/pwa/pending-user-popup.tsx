'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function PendingUserPopup() {
    const [showPopup, setShowPopup] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        const sb = createClient()
        sb.auth.getUser().then(({ data }) => {
            if (!data.user) return
            sb.from('profiles').select('status').eq('id', data.user.id).single().then(({ data: profile }) => {
                if (profile?.status === 'pending') {
                    setStatus('pending')
                    setShowPopup(true)
                } else if (profile?.status === 'rejected') {
                    setStatus('rejected')
                    setShowPopup(true)
                }
            })
        })
    }, [])

    if (!status) return null

    return (
        <ConfirmModal
            open={showPopup}
            onOpenChange={setShowPopup}
            variant={status === 'pending' ? 'warning' : 'error'}
            title={status === 'pending' ? 'Tài khoản đang chờ duyệt' : 'Tài khoản bị từ chối'}
            description={
                status === 'pending'
                    ? 'Tài khoản của bạn đang chờ Admin duyệt. Bạn chỉ có thể xem trang chủ cho đến khi được duyệt. Vui lòng quay lại sau!'
                    : 'Tài khoản của bạn đã bị từ chối bởi Admin. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.'
            }
            confirmText="Đã hiểu"
            onConfirm={() => setShowPopup(false)}
        />
    )
}
