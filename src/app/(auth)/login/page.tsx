'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        setLoading(false)
        if (error) {
            toast.error(error.message === 'Invalid login credentials'
                ? 'Email hoặc mật khẩu không đúng'
                : error.message)
            return
        }
        toast.success('Đăng nhập thành công!')
        router.push('/tree')
        router.refresh()
    }

    const handleGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/tree` }
        })
        if (error) toast.error(error.message)
    }

    return (
        <div className="min-h-screen flex">
            {/* Left panel — decorative */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 gold-gradient opacity-90" />
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
                    <div className="text-8xl mb-6 drop-shadow-2xl">🌳</div>
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        Gia Phả<br />Trần Tộc Mỹ Nguyên
                    </h1>
                    <p className="text-white/80 text-lg max-w-xs leading-relaxed">
                        Lưu giữ và kết nối các thế hệ dòng họ qua thời gian
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-6 text-white/70 text-sm">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">4+</div>
                            <div>Thế hệ</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">18+</div>
                            <div>Thành viên</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white">100+</div>
                            <div>Năm lịch sử</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center">
                        <div className="text-5xl mb-3">🌳</div>
                        <h2 className="text-xl font-bold">Trần Tộc Mỹ Nguyên</h2>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Đăng nhập</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Chào mừng trở lại, thành viên dòng họ 👋
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ten@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-3 text-muted-foreground">Hoặc</span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full gap-3"
                        onClick={handleGoogle}
                        disabled={loading}
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Đăng nhập với Google
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-primary font-medium hover:underline">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
