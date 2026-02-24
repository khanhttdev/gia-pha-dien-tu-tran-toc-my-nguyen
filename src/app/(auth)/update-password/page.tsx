'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
    const router = useRouter()
    const supabase = createClient()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [showConfirmPass, setShowConfirmPass] = useState(false)
    const [loading, setLoading] = useState(false)

    // Validation Regex
    const hasUpperCase = /[A-Z]/
    const hasLowerCase = /[a-z]/
    const hasNumber = /[0-9]/
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/
    const isLengthValid = password.length >= 8

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        // Strict Validation
        if (!password || !confirmPassword) {
            toast.error('Vui lòng nhập đầy đủ thông tin')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }

        if (!isLengthValid || !hasUpperCase.test(password) || !hasLowerCase.test(password) || !hasNumber.test(password) || !hasSpecialChar.test(password)) {
            toast.error('Mật khẩu không đạt yêu cầu bảo mật')
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password })
        setLoading(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success('Cập nhật mật khẩu thành công!')

        // Optional: Logout user to re-login with new password, or just redirect to home
        router.push('/login')
    }

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left panel — decorative heritage */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-background border-r border-border/50">
                <div
                    className="absolute inset-0 opacity-15 mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/90 mix-blend-multiply" />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

                <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center h-full w-full">
                    <div className="w-24 h-24 mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                        <span className="text-6xl drop-shadow-lg">🌳</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight font-serif">
                        Gia Phả <br />
                        <span className="text-primary">Trần Tộc Mỹ Nguyên</span>
                    </h1>
                </div>
            </div>

            {/* Right panel — update password form */}
            <div className="flex-1 flex justify-center items-center p-6 sm:p-12 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-orange-500/5 blur-[100px] pointer-events-none" />

                <div className="w-full max-w-md space-y-8 relative z-10 glass p-8 sm:p-10 rounded-3xl shadow-sm border border-border/50">

                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gold-gradient flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🌳</span>
                        </div>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Tạo mật khẩu mới</h2>
                        <p className="text-muted-foreground mt-2 text-sm font-medium">
                            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground/80 font-semibold">Mật khẩu mới</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={loading}
                                    className="h-11 rounded-xl bg-white/50 border-border/80 focus:bg-white transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-foreground/80 font-semibold">Xác nhận mật khẩu</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPass ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    className="h-11 rounded-xl bg-white/50 border-border/80 focus:bg-white transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                >
                                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password rules feedback */}
                        <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-2">
                            <p className="font-semibold text-foreground/80 mb-2">Yêu cầu mật khẩu:</p>
                            <ul className="space-y-1">
                                <li className={`flex items-center gap-2 ${isLengthValid ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    <span className="text-lg">{isLengthValid ? '✓' : '○'}</span> Tối thiểu 8 ký tự
                                </li>
                                <li className={`flex items-center gap-2 ${hasUpperCase.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    <span className="text-lg">{hasUpperCase.test(password) ? '✓' : '○'}</span> Chứa chữ in hoa (A-Z)
                                </li>
                                <li className={`flex items-center gap-2 ${hasLowerCase.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    <span className="text-lg">{hasLowerCase.test(password) ? '✓' : '○'}</span> Chứa chữ in thường (a-z)
                                </li>
                                <li className={`flex items-center gap-2 ${hasNumber.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    <span className="text-lg">{hasNumber.test(password) ? '✓' : '○'}</span> Chứa số (0-9)
                                </li>
                                <li className={`flex items-center gap-2 ${hasSpecialChar.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                                    <span className="text-lg">{hasSpecialChar.test(password) ? '✓' : '○'}</span> Chứa ký tự đặc biệt (!@#$...)
                                </li>
                            </ul>
                        </div>

                        <Button type="submit" className="w-full h-11 rounded-xl gold-gradient border-0 text-amber-950 font-bold text-base shadow-md hover:shadow-lg hover:opacity-95 transition-all" disabled={loading}>
                            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            Cập nhật mật khẩu
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
