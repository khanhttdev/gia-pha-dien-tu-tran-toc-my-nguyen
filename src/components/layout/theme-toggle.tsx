'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-amber-100/70">
                <Sun className="h-4 h-4" />
                <span className="text-sm font-medium">Sáng / Tối</span>
            </Button>
        )
    }

    const isDark = theme === 'dark'

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-amber-100/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? (
                <>
                    <Moon className="h-4 w-4 text-blue-300" />
                    <span className="text-sm font-medium">Giao diện: Tối</span>
                </>
            ) : (
                <>
                    <Sun className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium">Giao diện: Sáng</span>
                </>
            )}
        </Button>
    )
}
