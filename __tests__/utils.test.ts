import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
    describe('cn()', () => {
        it('should merge tailwind classes correctly', () => {
            const result = cn('text-red-500', 'bg-blue-500', { 'text-green-500': true })
            expect(result).toBe('bg-blue-500 text-green-500')
        })

        it('should handle undefined or null classes gracefully', () => {
            const result = cn('p-4', undefined, null, 'm-2')
            expect(result).toBe('p-4 m-2')
        })
    })
})
