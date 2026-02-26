'use client'

import { useState, useEffect } from 'react'
import { getFunds, addTransaction, deleteTransaction, getFundBalance, updateTransaction } from '@/lib/fund-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, Plus, ArrowUpRight, ArrowDownRight, Trash2, ChevronDown, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export function FundManagerTab() {
    const [funds, setFunds] = useState<any[]>([])
    const [balance, setBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
    const [isAdding, setIsAdding] = useState(false)

    // form add
    const [type, setType] = useState('income')
    const [amount, setAmount] = useState('')
    const [desc, setDesc] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // form edit
    const [editingTx, setEditingTx] = useState<any>(null)
    const [editType, setEditType] = useState('income')
    const [editAmount, setEditAmount] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [editDate, setEditDate] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    // delete
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    const handleDelete = async () => {
        if (!deletingId) return
        const res = await deleteTransaction(deletingId)
        if (res.error) toast.error(res.error)
        else {
            toast.success('Đã xóa')
            setDeletingId(null)
            load() // reset
        }
    }

    const startEdit = (tx: any) => {
        setEditingTx(tx)
        setEditType(tx.transaction_type)
        setEditAmount(tx.amount.toString())
        setEditDesc(tx.description)
        setEditDate(new Date(tx.transaction_date).toISOString().split('T')[0])
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editAmount || !editDesc) return toast.error('Vui lòng nhập đủ thông tin')

        setIsUpdating(true)
        const formData = new FormData()
        formData.append('transaction_type', editType)
        formData.append('amount', editAmount.replace(/,/g, ''))
        formData.append('description', editDesc)
        formData.append('transaction_date', editDate)

        const res = await updateTransaction(editingTx.id, formData)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success('Cập nhật thành công')
            setEditingTx(null)
            await load()
        }
        setIsUpdating(false)
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
                                <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0 border-dashed">
                                    <span className={cn(
                                        "font-bold font-mono tracking-tight mr-2",
                                        f.transaction_type === 'income' ? "text-emerald-500" : "text-red-500"
                                    )}>
                                        {f.transaction_type === 'income' ? '+' : '-'}{formatCurrency(f.amount)}
                                    </span>
                                    <Button aria-label="Sửa giao dịch" size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50/10" onClick={() => startEdit(f)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button aria-label="Xóa giao dịch" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => setDeletingId(f.id)}>
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

            {/* Dialog Edit */}
            <Dialog open={!!editingTx} onOpenChange={(o) => (!o) && setEditingTx(null)}>
                <DialogContent className="sm:max-w-[425px] glass border-amber-500/20">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa giao dịch</DialogTitle>
                        <DialogDescription>
                            Chỉnh sửa này sẽ được ghi nhận vào nhật ký quỹ để đảm bảo minh bạch.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase font-bold">Loại giao dịch</label>
                            <select value={editType} onChange={e => setEditType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                                <option value="income">Thu vào (+)</option>
                                <option value="expense">Chi ra (-)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase font-bold">Số tiền (VNĐ)</label>
                            <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} required min="0" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase font-bold">Mô tả lý do</label>
                            <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-muted-foreground uppercase font-bold">Ngày chứng từ</label>
                            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button type="button" variant="outline" onClick={() => setEditingTx(null)}>Hủy</Button>
                            <Button type="submit" disabled={isUpdating} className="bg-amber-600 hover:bg-amber-700 text-white min-w-[100px]">
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cập nhật'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Delete */}
            <AlertDialog open={!!deletingId} onOpenChange={(o) => (!o) && setDeletingId(null)}>
                <AlertDialogContent className="glass border-red-500/20 sm:max-w-[400px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hủy giao dịch thu/chi này?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Số dư quỹ sẽ tự động cộng/trừ lại dựa trên thay đổi này. Lịch sử xóa sẽ được lưu vào nhật ký hệ thống.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white border-none shadow-lg">
                            Chắc chắn xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
