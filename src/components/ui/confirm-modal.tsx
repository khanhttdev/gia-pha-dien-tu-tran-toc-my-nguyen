'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Info, XCircle, Loader2, Trash2, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ModalVariant = 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'destructive'

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
    destructive: {
        icon: Trash2,
        iconClass: 'text-red-400 bg-gradient-to-br from-red-500/20 to-red-600/10 ring-2 ring-red-500/20',
        confirmClass: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20',
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

    const isDestructive = variant === 'destructive'
    const showCancel = variant === 'confirm' || variant === 'warning' || variant === 'error' || variant === 'destructive'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                'glass sm:max-w-md',
                isDestructive ? 'border-red-500/30 shadow-xl shadow-red-500/5' : 'border-border/60'
            )}>
                <DialogHeader className="items-center text-center gap-3">
                    <div className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300',
                        isDestructive && 'animate-in zoom-in-50 duration-300',
                        config.iconClass
                    )}>
                        <Icon className={cn('w-7 h-7', isDestructive && 'animate-in spin-in-12 duration-500')} />
                    </div>
                    <DialogTitle className={cn('text-lg', isDestructive && 'text-red-500')}>
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-sm text-muted-foreground">
                            {description}
                        </DialogDescription>
                    )}
                    {isDestructive && (
                        <div className="flex items-center gap-2 text-xs text-red-400/80 bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/10">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span>Hành động này không thể hoàn tác</span>
                        </div>
                    )}
                </DialogHeader>

                {children && <div className="py-2">{children}</div>}

                <DialogFooter className="flex-row gap-2 sm:justify-center pt-2">
                    {showCancel && (
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
                        {isDestructive && <Trash2 className="w-4 h-4" />}
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
