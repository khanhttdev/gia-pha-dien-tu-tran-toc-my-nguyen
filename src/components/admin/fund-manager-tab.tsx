'use client'

import { useState, useEffect } from 'react'
import { getFunds, addTransaction, deleteTransaction, getFundBalance } from '@/lib/fund-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, ArrowUpRight, ArrowDownRight, Trash2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FundManagerTab() {
    const [funds, setFunds] = useState<any[]>([])
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
    const [isAdding, setIsAdding] = useState(false)

    // form
    const [type, setType] = useState('income')
    const [amount, setAmount] = useState('')
    const [desc, setDesc] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    useEffect(() => {
        load()
    }, [])

    const load = async (cursor?: string, append = false) => {
        if (append) setLoadingMore(true)
        else setLoading(true)

        const [resFunds, resBal] = await Promise.all([
            getFunds(cursor, 20),
            append ? Promise.resolve({ error: null, balance: balance }) : getFundBalance()
        ])

        if (resFunds.data) {
            setFunds(prev => append ? [...prev, ...resFunds.data!] : resFunds.data!)
            setHasMore(resFunds.hasMore)
            setNextCursor(resFunds.nextCursor)
        }
        if (!append && !resBal.error) setBalance((resBal as any).balance)

        if (append) setLoadingMore(false)
        else setLoading(false)
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !desc) return toast.error('Vui lòng nhập đủ số tiền và lý do')

        setIsAdding(true)
        const formData = new FormData()
        formData.append('transaction_type', type)
        formData.append('amount', amount.replace(/,/g, ''))
        formData.append('description', desc)
        formData.append('transaction_date', date)

        const res = await addTransaction(formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Đã ghi nhận giao dịch')
            setAmount('')
            setDesc('')
            await load() // reset
        }
        setIsAdding(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa giao dịch này? Số dư sẽ bị thay đổi.')) return
        const res = await deleteTransaction(id)
        if (res.error) toast.error(res.error)
        else {
            toast.success('Đã xóa')
            load() // reset
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    }

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            {/* Cụm Số Dư */}
            <div className="glass rounded-xl p-6 border border-amber-500/20 text-center space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Số dư quỹ hiện tại</h3>
                <p className={cn("text-4xl font-black font-playfair", balance >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {formatCurrency(balance)}
                </p>
            </div>

            {/* Form Nhập */}
            <form onSubmit={handleAdd} className="glass rounded-xl p-4 border border-border/50 flex flex-wrap gap-4 items-end">
                <div className="w-[120px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Loại</label>
                    <select value={type} onChange={e => setType(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm">
                        <option value="income">Thu vào (+)</option>
                        <option value="expense">Chi ra (-)</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[150px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Số tiền (VNĐ)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0" placeholder="0" className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm" />
                </div>
                <div className="flex-2 min-w-[200px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Lý do / Mô tả</label>
                    <input type="text" value={desc} onChange={e => setDesc(e.target.value)} required placeholder="Ví dụ: Đóng quỹ đinh năm 2026..." className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm" />
                </div>
                <div className="w-[140px] space-y-1.5">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Ngày</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm" />
                </div>
                <Button type="submit" disabled={isAdding} className="h-9 gap-1.5 shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Thêm</>}
                </Button>
            </form>

            {/* Lịch sử */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">Lịch sử Giao dịch</h3>
                {funds.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Chưa có giao dịch quỹ nào được ghi nhận.</p>
                ) : (
                    <div className="space-y-2">
                        {funds.map((f: any) => (
                            <div key={f.id} className="glass rounded-xl p-3 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors hover:bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                        f.transaction_type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                    )}>
                                        {f.transaction_type === 'income' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{f.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-muted-foreground">{new Date(f.transaction_date).toLocaleDateString('vi-VN')}</p>
                                            {f.person && <Badge variant="outline" className="text-[10px] py-0 px-1.5">{f.person.full_name}</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0 border-dashed">
                                    <span className={cn(
                                        "font-bold font-mono tracking-tight",
                                        f.transaction_type === 'income' ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        {f.transaction_type === 'income' ? '+' : '-'}{formatCurrency(f.amount)}
                                    </span>
                                    <Button aria-label="Action Button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => handleDelete(f.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Load More */}
                        {hasMore && (
                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => load(nextCursor, true)}
                                    disabled={loadingMore}
                                    className="gap-2 rounded-full text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                >
                                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                                    {loadingMore ? 'Đang tải...' : 'Tải thêm giao dịch'}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
