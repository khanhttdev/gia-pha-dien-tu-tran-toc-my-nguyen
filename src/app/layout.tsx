import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Gia Phả Trần Tộc Mỹ Nguyên',
  description: 'Website gia phả điện tử dòng họ Trần tộc Mỹ Nguyên — lưu giữ và kết nối các thế hệ',
  keywords: ['gia phả', 'Trần tộc', 'Mỹ Nguyên', 'dòng họ', 'cây gia phả'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Gia Phả Trần Tộc Mỹ Nguyên',
    description: 'Website gia phả điện tử dòng họ Trần tộc Mỹ Nguyên',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
