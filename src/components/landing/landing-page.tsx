'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
    GitFork, Users, BookOpen, CalendarDays, ImageIcon,
    ArrowRight, Sparkles, Heart, TreePine
} from 'lucide-react'

function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('animate-in')
                    observer.unobserve(el)
                }
            },
            { threshold: 0.15 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])
    return ref
}

function RevealSection({ children, className = '', delay = '' }: {
    children: React.ReactNode
    className?: string
    delay?: string
}) {
    const ref = useScrollReveal()
    return (
        <div
            ref={ref}
            className={`reveal-section ${className}`}
            style={{ transitionDelay: delay }}
        >
            {children}
        </div>
    )
}

function AnimatedCounter({ target, label }: { target: string; label: string }) {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('counted')
                    observer.unobserve(el)
                }
            },
            { threshold: 0.5 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className="counter-card text-center space-y-2 p-6 rounded-2xl glass group hover:bg-white/10 transition-all duration-300">
            <div className="text-4xl sm:text-5xl font-serif font-black gold-text">{target}</div>
            <div className="text-amber-200/70 text-sm font-semibold uppercase tracking-widest">{label}</div>
        </div>
    )
}

const features = [
    {
        icon: GitFork,
        title: 'Cây Gia Phả Tương Tác',
        desc: 'Khám phá mối quan hệ gia đình qua cây gia phả trực quan, có thể phóng to, thu nhỏ và điều hướng.',
        color: 'from-emerald-500/20 to-teal-500/20',
        iconColor: 'text-emerald-400',
    },
    {
        icon: BookOpen,
        title: 'Sách Gia Phả Số',
        desc: 'Lưu giữ câu chuyện, tiểu sử và kỷ niệm của từng thành viên trong dòng họ.',
        color: 'from-blue-500/20 to-indigo-500/20',
        iconColor: 'text-blue-400',
    },
    {
        icon: CalendarDays,
        title: 'Sự Kiện & Kỷ Niệm',
        desc: 'Theo dõi các sự kiện quan trọng, ngày giỗ, lễ hội và hoạt động của dòng họ.',
        color: 'from-rose-500/20 to-pink-500/20',
        iconColor: 'text-rose-400',
    },
    {
        icon: Users,
        title: 'Danh Bạ Gia Đình',
        desc: 'Kết nối dễ dàng với các thành viên qua danh bạ thông tin liên lạc đầy đủ.',
        color: 'from-amber-500/20 to-orange-500/20',
        iconColor: 'text-amber-400',
    },
    {
        icon: ImageIcon,
        title: 'Thư Viện Ảnh',
        desc: 'Bộ sưu tập hình ảnh quý giá từ các thế hệ — ảnh gia đình, sự kiện, di tích.',
        color: 'from-violet-500/20 to-purple-500/20',
        iconColor: 'text-violet-400',
    },
    {
        icon: Sparkles,
        title: 'Trợ Lý AI Mei',
        desc: 'Hỏi đáp thông minh về gia phả: tìm quan hệ, tra cứu thông tin, gợi ý câu chuyện.',
        color: 'from-cyan-500/20 to-sky-500/20',
        iconColor: 'text-cyan-400',
    },
]

export function LandingPage() {
    return (
        <div className="min-h-screen overflow-x-hidden">
            {/* ============ HERO ============ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[5%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
                    <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-amber-600/6 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute top-[40%] right-[30%] w-[200px] h-[200px] rounded-full bg-rose-500/4 blur-[80px]" />
                </div>

                {/* Heritage pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Logo */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mb-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl hero-logo">
                        <span className="text-5xl sm:text-6xl drop-shadow-lg">🌳</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black text-foreground leading-[1.1] tracking-tight mb-6">
                        Gia Phả{' '}
                        <span className="gold-text">Trần Tộc</span>
                        <br />
                        <span className="text-3xl sm:text-4xl md:text-5xl text-amber-200/80">Mỹ Nguyên</span>
                    </h1>

                    {/* Tagline */}
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10 font-medium">
                        Lưu giữ cội nguồn — Kết nối các thế hệ qua thời gian.
                        <br className="hidden sm:block" />
                        Nơi mỗi nhánh cây kể một câu chuyện.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gold-gradient text-amber-950 font-bold text-base shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                        >
                            Đăng nhập
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass text-foreground font-semibold text-base hover:bg-white/10 transition-all duration-300 border border-border/50"
                        >
                            Đăng ký tài khoản
                        </Link>
                    </div>

                    {/* Scroll hint */}
                    <div className="mt-16 sm:mt-20 animate-bounce" style={{ animationDuration: '2s' }}>
                        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5">
                            <div className="w-1.5 h-3 rounded-full bg-muted-foreground/50 animate-scroll-dot" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ GIỚI THIỆU ============ */}
            <section className="relative py-20 sm:py-28 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <RevealSection>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-amber-200/80 text-xs font-bold uppercase tracking-widest mb-8 border border-amber-500/20">
                            <Heart className="w-3.5 h-3.5" />
                            Về Dòng Họ
                        </div>
                    </RevealSection>

                    <RevealSection delay="100ms">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                            Gìn giữ <span className="gold-text">di sản</span> cho muôn đời
                        </h2>
                    </RevealSection>

                    <RevealSection delay="200ms">
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                            Dòng họ Trần tộc Mỹ Nguyên trải qua nhiều thế hệ, mang theo những câu chuyện,
                            truyền thống và giá trị quý báu. Website gia phả điện tử này ra đời với sứ mệnh
                            lưu giữ và kết nối — để thế hệ hôm nay hiểu rõ cội nguồn, và thế hệ mai sau
                            không quên gốc rễ.
                        </p>
                    </RevealSection>

                    <RevealSection delay="300ms">
                        <div className="flex items-center justify-center gap-8 text-muted-foreground/60">
                            <div className="w-12 h-px bg-gradient-to-r from-transparent to-amber-500/30" />
                            <TreePine className="w-5 h-5 text-primary/50" />
                            <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-500/30" />
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ============ TÍNH NĂNG ============ */}
            <section className="relative py-20 sm:py-28 px-6">
                <div className="max-w-6xl mx-auto">
                    <RevealSection className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-amber-200/80 text-xs font-bold uppercase tracking-widest mb-6 border border-amber-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            Tính Năng
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight">
                            Tất cả trong <span className="gold-text">một nơi</span>
                        </h2>
                    </RevealSection>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <RevealSection key={f.title} delay={`${i * 80}ms`}>
                                <div className="group relative p-6 rounded-2xl glass border border-border/30 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full">
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${f.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                            <f.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============ THỐNG KÊ ============ */}
            <section className="relative py-20 sm:py-28 px-6">
                <div className="max-w-4xl mx-auto">
                    <RevealSection className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
                            Dòng họ qua <span className="gold-text">những con số</span>
                        </h2>
                    </RevealSection>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <AnimatedCounter target="4+" label="Thế hệ" />
                        <AnimatedCounter target="18+" label="Thành viên" />
                        <AnimatedCounter target="100+" label="Năm lịch sử" />
                    </div>
                </div>
            </section>

            {/* ============ CTA CUỐI ============ */}
            <section className="relative py-20 sm:py-28 px-6">
                <RevealSection>
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="relative p-10 sm:p-14 rounded-3xl overflow-hidden">
                            {/* Card background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-primary/5 to-rose-500/10 rounded-3xl" />
                            <div className="absolute inset-0 glass rounded-3xl" />
                            <div
                                className="absolute inset-0 opacity-[0.04] rounded-3xl pointer-events-none"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                }}
                            />

                            <div className="relative z-10">
                                <span className="text-5xl mb-6 block">🏡</span>
                                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                                    Hãy cùng lưu giữ <span className="gold-text">cội nguồn</span>
                                </h2>
                                <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto mb-8 leading-relaxed">
                                    Tham gia cùng các thành viên trong dòng họ để xây dựng và bảo tồn
                                    gia phả — một di sản vô giá cho thế hệ mai sau.
                                </p>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gold-gradient text-amber-950 font-bold text-base shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    Tham Gia Ngay
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </RevealSection>
            </section>

            {/* ============ FOOTER ============ */}
            <footer className="relative py-10 px-6 border-t border-border/30">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🌳</span>
                        <span className="font-serif font-bold text-foreground/80">Trần Tộc Mỹ Nguyên</span>
                    </div>
                    <p>© {new Date().getFullYear()} Gia Phả Điện Tử. Mọi quyền được bảo lưu.</p>
                </div>
            </footer>
        </div>
    )
}
