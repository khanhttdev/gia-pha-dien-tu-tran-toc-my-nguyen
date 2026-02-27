'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !email || !password) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }
        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/tree`
            }
        })
        setLoading(false)
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success('Đăng ký thành công! Vui lòng kiểm tra và xác nhận email của bạn để có thể đăng nhập.')
        router.push('/login')
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left panel — decorative heritage */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-background border-r border-border/50">
                {/* Traditional Asian-inspired SVG Pattern */}
                <div
                    className="absolute inset-0 opacity-15 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/90 mix-blend-multiply" />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

                <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center h-full w-full">
                    <div className="w-24 h-24 mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden p-1">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight font-serif">
                        Gia Phả <br />
                        <span className="text-primary">Trần Tộc Mỹ Nguyên</span>
                    </h1>
                    <p className="text-amber-100/80 text-lg max-w-sm leading-relaxed font-medium">
                        Bắt đầu hành trình lưu giữ<br />và kết nối cội nguồn gia tộc
                    </p>

                    <div className="mt-16 grid grid-cols-2 gap-8 w-full max-w-sm">
                        <div className="text-center space-y-1">
                            <div className="text-3xl font-bold text-white font-serif">4+</div>
                            <div className="text-amber-200/70 text-sm font-medium uppercase tracking-wider">Thế hệ</div>
                        </div>
                        <div className="text-center space-y-1">
                            <div className="text-3xl font-bold text-white font-serif">100+</div>
                            <div className="text-amber-200/70 text-sm font-medium uppercase tracking-wider">Năm lịch sử</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right panel — register form */}
            <div className="flex-1 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden">
                {/* Soft ambient glows for Right Panel */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

                <div className="w-full max-w-md space-y-8 relative z-10 glass p-8 sm:p-10 rounded-3xl shadow-sm border border-border/50">

                    {/* Mobile internal logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center shadow-lg overflow-hidden p-1">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Đăng ký tài khoản</h2>
                        <p className="text-muted-foreground mt-2 text-sm font-medium">
                            Tạo tài khoản mới để tham gia vào gia phả
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-foreground/80 font-semibold">Họ và tên</Label>
                            <Input
                                id="name"
                                placeholder="Trần Văn A"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={loading}
                                className="h-11 rounded-xl bg-white border-border/80 focus:ring-amber-500/30 transition-shadow text-amber-950 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground/80 font-semibold">Địa chỉ Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ten@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                                className="h-11 rounded-xl bg-white border-border/80 focus:ring-amber-500/30 transition-shadow text-amber-950 font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground/80 font-semibold">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                                className="h-11 rounded-xl bg-white border-border/80 focus:ring-amber-500/30 transition-shadow text-amber-950 font-medium"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11 rounded-xl mt-4 gold-gradient border-0 text-amber-950 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all" disabled={loading}>
                            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            Đăng ký
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground font-medium pt-2">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-amber-600 font-bold hover:text-amber-700 hover:underline transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
