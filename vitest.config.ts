import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        // Only run unit tests in __tests__/, exclude Playwright spec files in tests/
        include: ['__tests__/**/*.test.ts', '__tests__/**/*.test.tsx'],
        exclude: ['tests/**', 'node_modules/**'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/lib/**/*.ts'],
            exclude: [
                'src/lib/database.types.ts',
                'src/lib/supabase-client.ts',
                'src/lib/supabase-server.ts',
            ],
            thresholds: {
                lines: 50,
                functions: 50,
            },
        },
    },
})
