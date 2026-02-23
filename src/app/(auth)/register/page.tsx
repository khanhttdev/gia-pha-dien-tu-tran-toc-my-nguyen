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
            options: { data: { full_name: name } }
        })
        setLoading(false)
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success('Đăng ký thành công! Tài khoản đang chờ Admin duyệt.')
        router.push('/login')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="text-5xl mb-3">🌳</div>
                    <h2 className="text-2xl font-bold">Đăng ký tài khoản</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Tài khoản sẽ được Admin Trần Tộc xét duyệt
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input id="name" placeholder="Trần Văn A" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="ten@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu</Label>
                        <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                    </div>
                    <Button type="submit" className="w-full gold-gradient border-0 text-amber-950 font-semibold hover:opacity-90" disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Đăng ký
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    )
}
