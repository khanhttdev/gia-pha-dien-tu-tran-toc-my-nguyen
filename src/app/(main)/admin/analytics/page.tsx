'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, ArrowLeft, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const COLORS = ['#f59e0b', '#3b82f6', '#f43f5e', '#10b981']

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        males: 0,
        females: 0,
        byGen: [] as any[],
        alive: 0,
        deceased: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            const sb = createClient()
            const { data: people } = await sb.from('members').select('gender, generation_level, metadata')
            if (!people) return

            const maleCount = people.filter((p: any) => p.gender === 'male').length
            const femaleCount = people.filter((p: any) => p.gender === 'female').length
            const aliveCount = people.filter((p: any) => (p.metadata as any)?.is_alive !== false).length

            const genMap: Record<number, number> = {}
            people.forEach((p: any) => {
                const g = p.generation_level || 1
                genMap[g] = (genMap[g] || 0) + 1
            })

            const byGen = Object.keys(genMap).map(k => ({
                name: `Đời ${k}`,
                count: genMap[parseInt(k)]
            })).sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]))

            setStats({
                total: people.length,
                males: maleCount,
                females: femaleCount,
                alive: aliveCount,
                deceased: people.length - aliveCount,
                byGen
            })
            setLoading(false)
        }
        fetchStats()
    }, [])

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    }

    const genderData = [
        { name: 'Nam', value: stats.males },
        { name: 'Nữ', value: stats.females },
        { name: 'Chưa rõ', value: stats.total - stats.males - stats.females }
    ].filter(d => d.value > 0)

    const aliveData = [
        { name: 'Còn sống', value: stats.alive },
        { name: 'Đã mất', value: stats.deceased }
    ].filter(d => d.value > 0)

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin">
                    <Button aria-label="Action Button" variant="outline" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-amber-500" />
                    Thống kê Tổng quan Gia Phả
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center border border-amber-500/20 shadow-lg shadow-amber-500/5">
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">Tổng số nhân khẩu</div>
                    <div className="text-5xl font-black bg-gradient-to-br from-amber-200 to-amber-600 bg-clip-text text-transparent">
                        {stats.total}
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Tỷ lệ Giới tính</h3>
                    <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={genderData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                                    {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: any) => [`${value} người`, 'Số lượng']} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fcd34d' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold mt-2">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Nam ({Math.round((stats.males / stats.total) * 100)}%)</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Nữ ({Math.round((stats.females / stats.total) * 100)}%)</div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-border/50 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-muted-foreground mb-4">Tình trạng Sự sống</h3>
                    <div className="h-[160px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={aliveData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                                    <Cell fill="#10b981" />
                                    <Cell fill="#64748b" />
                                </Pie>
                                <Tooltip formatter={(value: any) => [`${value} người`, 'Số lượng']} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fcd34d' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold mt-2">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Còn sống</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-500"></span> Đã mất</div>
                    </div>
                </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-border/50 mt-6 md:h-[350px]">
                <h3 className="text-sm font-bold mb-6 flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                    Phân bố theo thế hệ (Đời)
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byGen}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fcd34d' }} />
                            <Bar dataKey="count" name="Số người" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
