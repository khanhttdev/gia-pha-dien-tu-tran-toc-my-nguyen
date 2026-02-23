import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'Gia Phả Trần Tộc Mỹ Nguyên',
  description: 'Website gia phả điện tử dòng họ Trần tộc Mỹ Nguyên — lưu giữ và kết nối các thế hệ',
  keywords: ['gia phả', 'Trần tộc', 'Mỹ Nguyên', 'dòng họ', 'cây gia phả'],
  openGraph: {
    title: 'Gia Phả Trần Tộc Mỹ Nguyên',
    description: 'Website gia phả điện tử dòng họ Trần tộc Mỹ Nguyên',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
