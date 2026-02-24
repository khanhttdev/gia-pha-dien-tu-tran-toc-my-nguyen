'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="glass max-w-md w-full p-8 rounded-2xl border border-red-500/20 text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                        Đã xảy ra lỗi hệ thống
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Rất tiếc, đã có lỗi ngoài ý muốn. Vui lòng thử lại sau hoặc trở về trang chủ.
                    </p>
                </div>

                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 break-all text-left">
                    <code className="font-mono text-xs opacity-80">{error.message || 'Unknown error'}</code>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        onClick={() => reset()}
                        variant="default"
                        className="flex-1 rounded-xl gold-gradient text-amber-950 font-semibold"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Thử lại
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="flex-1 rounded-xl border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/10"
                    >
                        <Link href="/home">
                            <Home className="w-4 h-4 mr-2 text-amber-500" />
                            Trang chủ
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
