'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { getAllMembers, getAllSpouses } from '@/lib/supabase-data'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { BookOpen, ChevronDown, ChevronRight, Loader2, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type FamilyBranch = {
    member: Member
    children: FamilyBranch[]
    spouses: Spouse[]
}

function buildFamilyTree(members: Member[], spouses: Spouse[]): FamilyBranch[] {
    const map = new Map<string, Member>(members.map(m => [m.id, m]))
    const spouseByMember = new Map<string, Spouse[]>()
    spouses.forEach(s => {
        if (!spouseByMember.has(s.member_id)) spouseByMember.set(s.member_id, [])
        spouseByMember.get(s.member_id)!.push(s)
    })

    const childrenOf = new Map<string, Member[]>()
    members.forEach(m => {
        if (m.father_id && map.has(m.father_id)) {
            if (!childrenOf.has(m.father_id)) childrenOf.set(m.father_id, [])
            childrenOf.get(m.father_id)!.push(m)
        }
    })

    const hasParent = new Set(members.filter(m => m.father_id && map.has(m.father_id)).map(m => m.id))
    const roots = members.filter(m => !hasParent.has(m.id) && m.gender === 'male')

    const buildBranch = (m: Member): FamilyBranch => ({
        member: m,
        children: (childrenOf.get(m.id) ?? []).sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0)).map(buildBranch),
        spouses: spouseByMember.get(m.id) ?? [],
    })

    return roots.map(buildBranch)
}

function BranchSection({ branch, depth = 0 }: { branch: FamilyBranch; depth?: number }) {
    const [open, setOpen] = useState(depth < 2)
    const { member, spouses, children } = branch
    const meta = (member.metadata as MemberMetadata) || {}
    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join('–')

    return (
        <div className={cn('border-l-2 pl-4 mb-4', depth === 0 ? 'border-amber-500' : depth === 1 ? 'border-amber-400/50' : 'border-border')}>
            {/* Person header */}
            <div className="flex items-start gap-3 mb-2">
                <button
                    className="mt-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setOpen(!open)}
                >
                    {children.length > 0
                        ? open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                        : <span className="w-4 h-4 block" />
                    }
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('font-bold', depth === 0 ? 'text-base text-amber-600' : depth === 1 ? 'text-sm text-amber-700/80' : 'text-sm text-foreground/90')}>
                            {member.full_name}
                        </span>
                        {yearRange && <span className="text-xs text-muted-foreground">({yearRange})</span>}
                        {meta.is_alive === false && <span className="text-xs text-muted-foreground/60 italic">✝</span>}
                    </div>
                    {spouses.map(s => {
                        const sMeta = (s.metadata as MemberMetadata) || {}
                        return (
                            <p key={s.id} className="text-xs text-muted-foreground mt-0.5">
                                ♥ <span className="font-medium">{s.full_name}</span>
                                {sMeta.birth_year && <span className="ml-1">({[sMeta.birth_year, sMeta.death_year].filter(Boolean).join('–')})</span>}
                            </p>
                        )
                    })}
                    {meta.notes && depth === 0 && (
                        <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">{meta.notes}</p>
                    )}
                </div>
                <div className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5',
                    'border',
                    member.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-rose-400/10 border-rose-400/30 text-rose-400'
                )}>
                    {member.generation_level}
                </div>
            </div>

            {/* Children */}
            {open && children.length > 0 && (
                <div className="pl-4 space-y-0">
                    {children.map(child => (
                        <BranchSection key={child.member.id} branch={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function BookPage() {
    const [members, setMembers] = useState<Member[]>([])
    const [spouses, setSpouses] = useState<Spouse[]>([])
    const [loading, setLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)

    const handleExportPDF = async () => {
        if (!printRef.current) return
        try {
            setIsExporting(true)
            const html2canvas = (await import('html2canvas')).default
            const { jsPDF } = await import('jspdf')

            toast.info('Đang chuẩn bị trang in, vui lòng đợi...', { duration: 3000 })

            // Chụp canvas với thiết lập chất lượng cao
            const canvas = await html2canvas(printRef.current, {
                scale: 2, // Tăng độ phân giải
                useCORS: true,
                logging: false,
                backgroundColor: '#31090A',
                windowWidth: 1200, // Giả lập màn hình rộng để dàn trang đẹp
                onclone: (clonedDoc) => {
                    // Ép độ rộng cho container in để không bị bó hẹp kiểu mobile
                    const printEl = clonedDoc.querySelector('[data-print-container]') as HTMLElement
                    if (printEl) {
                        printEl.style.width = '1150px'
                        printEl.style.padding = '80px'
                        printEl.style.maxWidth = 'none'
                        printEl.style.margin = '0 auto'
                    }

                    // Xử lý các hệ màu hiện đại (lab, oklch) mà html2canvas chưa hỗ trợ
                    const allElements = clonedDoc.getElementsByTagName('*')
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement
                        const style = window.getComputedStyle(el)
                        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor']

                        colorProps.forEach(prop => {
                            const val = (style as any)[prop]
                            if (val && (val.includes('lab') || val.includes('oklch') || val.includes('oklab'))) {
                                if (prop === 'color') el.style.color = '#ffffff'
                                if (prop === 'backgroundColor') {
                                    if (el.classList.contains('glass')) el.style.backgroundColor = 'rgba(255,255,255,0.08)'
                                    else el.style.backgroundColor = 'transparent'
                                }
                                if (prop.includes('Color')) el.style.borderColor = 'rgba(255,255,255,0.1)'
                            }
                        })
                    }

                    // Tinh chỉnh hiệu ứng glass cho bản in
                    const glasses = clonedDoc.querySelectorAll('.glass')
                    glasses.forEach(el => {
                        (el as HTMLElement).style.backdropFilter = 'none';
                        (el as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)';
                        (el as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.12)';
                    })

                    // Tinh chỉnh hiệu ứng chữ vàng (tránh bị mất chữ do clipping)
                    const goldTexts = clonedDoc.querySelectorAll('.gold-text')
                    goldTexts.forEach(el => {
                        (el as HTMLElement).style.webkitBackgroundClip = 'initial';
                        (el as HTMLElement).style.webkitTextFillColor = 'initial';
                        (el as HTMLElement).style.color = '#f59e0b';
                    })
                }
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            const pdf = new jsPDF('p', 'mm', 'a4')

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            // Tính toán kích thước ảnh để phủ kín chiều ngang A4 (có lề 10mm mỗi bên)
            const margin = 10
            const contentWidth = pdfWidth - (margin * 2)
            const imgProps = pdf.getImageProperties(imgData)
            const imgHeightInPdf = (imgProps.height * contentWidth) / imgProps.width

            let heightLeft = imgHeightInPdf
            let position = margin

            // Trang đầu tiên
            pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInPdf)
            heightLeft -= (pdfHeight - margin * 2)

            // Các trang tiếp theo nếu nội dung dài hơn 1 trang A4
            while (heightLeft > 0) {
                position = heightLeft - imgHeightInPdf + margin
                pdf.addPage()
                pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInPdf)
                heightLeft -= (pdfHeight - margin * 2)
            }

            pdf.save('Sách-Gia-Phả-Trần-Tộc.pdf')
            toast.success('Đã xuất file PDF thành công!')
        } catch (error: any) {
            console.error('Error exporting PDF:', error)
            toast.error(`Có lỗi xảy ra khi xuất PDF: ${error?.message || 'Lỗi không xác định'}`)
        } finally {
            setIsExporting(false)
        }
    }

    useEffect(() => {
        Promise.all([getAllMembers(), getAllSpouses()])
            .then(([m, s]) => { setMembers(m); setSpouses(s); setLoading(false) })
    }, [])

    const roots = useMemo(() => buildFamilyTree(members, spouses), [members, spouses])

    const stats = useMemo(() => ({
        total: members.length,
        alive: members.filter(m => (m.metadata as MemberMetadata)?.is_alive !== false).length,
        gens: new Set(members.map(m => m.generation_level)).size,
    }), [members])

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-border glass">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-amber-900" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold leading-none">Sách Gia Phả</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Trần Tộc Mỹ Nguyên — tự động tạo từ dữ liệu</p>
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                            onClick={handleExportPDF}
                            disabled={isExporting || loading}
                        >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">Xuất PDF</span>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (
                    <div ref={printRef} data-print-container className="pb-8 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                        {/* Header */}
                        <div className="text-center mb-10 p-10 glass rounded-3xl border border-border/60">
                            <div className="text-6xl mb-6">📖</div>
                            <h2 className="text-3xl font-extrabold gold-text mb-3 tracking-tight">GIA PHẢ TRẦN TỘC MỸ NGUYÊN</h2>
                            <p className="text-base text-muted-foreground italic">Lưu giữ và truyền thừa qua các thế hệ</p>
                            <div className="grid grid-cols-3 gap-8 mt-10">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">{stats.total}</div>
                                    <div className="text-xs text-muted-foreground">Thành viên</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">{stats.gens}</div>
                                    <div className="text-xs text-muted-foreground">Thế hệ</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-amber-500">{stats.alive}</div>
                                    <div className="text-xs text-muted-foreground">Còn sống</div>
                                </div>
                            </div>
                        </div>

                        {/* Family tree book format */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phả Hệ</h3>
                            {roots.map(branch => (
                                <BranchSection key={branch.member.id} branch={branch} depth={0} />
                            ))}
                        </div>

                        {/* All members by generation */}
                        <div className="mt-12 pt-10 border-t border-border/40">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">Danh Sách Theo Thế Hệ</h3>
                            <div className="space-y-6">
                                {Array.from(new Set(members.map(m => m.generation_level))).sort().map(gen => {
                                    const genMembers = members.filter(m => m.generation_level === gen)
                                    return (
                                        <div key={gen} className="glass rounded-2xl p-6 border border-border/60">
                                            <p className="text-base font-semibold text-amber-500 mb-1">Thế hệ thứ {gen}</p>
                                            <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">{genMembers.length} thành viên ({genMembers.filter(m => (m.metadata as MemberMetadata)?.is_alive === false).length} đã mất)</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                                                {genMembers.map(m => {
                                                    const mMeta = (m.metadata as MemberMetadata) || {}
                                                    return (
                                                        <div key={m.id} className="flex items-center gap-2 text-sm text-foreground/80">
                                                            <span className="text-muted-foreground/40">{m.gender === 'male' ? '♂' : m.gender === 'female' ? '♀' : '—'}</span>
                                                            <span className="font-medium">{m.full_name}</span>
                                                            {(mMeta.birth_year || mMeta.death_year) && (
                                                                <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                                                                    {[mMeta.birth_year, mMeta.death_year].filter(Boolean).join('–')}
                                                                </span>
                                                            )}
                                                            {mMeta.is_alive === false && <span className="text-xs text-muted-foreground/50">✝</span>}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
