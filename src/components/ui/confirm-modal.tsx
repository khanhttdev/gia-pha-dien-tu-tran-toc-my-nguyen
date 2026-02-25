'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Info, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModalVariant = 'info' | 'success' | 'warning' | 'error' | 'confirm'

interface ConfirmModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    variant?: ModalVariant
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void | Promise<void>
    onCancel?: () => void
    loading?: boolean
    children?: React.ReactNode
}

const variantConfig = {
    info: {
        icon: Info,
        iconClass: 'text-blue-400 bg-blue-500/10',
        confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    success: {
        icon: CheckCircle2,
        iconClass: 'text-emerald-400 bg-emerald-500/10',
        confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    warning: {
        icon: AlertTriangle,
        iconClass: 'text-amber-400 bg-amber-500/10',
        confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    error: {
        icon: XCircle,
        iconClass: 'text-red-400 bg-red-500/10',
        confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    confirm: {
        icon: AlertTriangle,
        iconClass: 'text-amber-400 bg-amber-500/10',
        confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
}

export function ConfirmModal({
    open,
    onOpenChange,
    title,
    description,
    variant = 'info',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    onConfirm,
    onCancel,
    loading = false,
    children,
}: ConfirmModalProps) {
    const config = variantConfig[variant]
    const Icon = config.icon

    const handleConfirm = async () => {
        if (onConfirm) await onConfirm()
    }

    const handleCancel = () => {
        onCancel?.()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass border-border/60 sm:max-w-md">
                <DialogHeader className="items-center text-center gap-3">
                    <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', config.iconClass)}>
                        <Icon className="w-7 h-7" />
                    </div>
                    <DialogTitle className="text-lg">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {children && <div className="py-2">{children}</div>}

                <DialogFooter className="flex-row gap-2 sm:justify-center pt-2">
                    {(variant === 'confirm' || variant === 'warning' || variant === 'error') && (
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1 sm:flex-none"
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn('flex-1 sm:flex-none gap-2', config.confirmClass)}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
