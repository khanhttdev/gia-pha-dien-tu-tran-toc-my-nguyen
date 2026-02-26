'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { getAllMembers, getAllSpouses } from '@/lib/supabase-data'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { BookOpen, ChevronDown, ChevronRight, Loader2, Download } from 'lucide-react'
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
        <div className={cn(
            'border-l-2 pl-4 mb-4 break-inside-avoid',
            depth === 0 ? 'border-amber-500/60' : depth === 1 ? 'border-amber-400/30' : 'border-border/40'
        )}>
            {/* Person header */}
            <div className="flex items-start gap-3 mb-2">
                <button
                    className="mt-0.5 text-muted-foreground hover:text-foreground no-print"
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

            toast.info('Đang chuẩn bị trang in nghệ thuật, vui lòng đợi...', { duration: 3000 })

            // Capture high-quality canvas
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#2A0708', // Darker maroon for print background
                windowWidth: 1200,
                onclone: (clonedDoc) => {
                    // 1. Forcing Desktop Layout
                    const printEl = clonedDoc.querySelector('[data-print-container]') as HTMLElement
                    if (printEl) {
                        printEl.style.width = '1150px'
                        printEl.style.padding = '100px 80px'
                        printEl.style.maxWidth = 'none'
                        printEl.style.margin = '0 auto'
                    }

                    // 2. Eradicate Modern Color Functions (LAB/OKLCH)
                    const allElements = clonedDoc.getElementsByTagName('*')
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement
                        const style = window.getComputedStyle(el)
                        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor']

                        colorProps.forEach(prop => {
                            const val = (style as any)[prop]
                            if (val && (val.includes('lab') || val.includes('oklch') || val.includes('oklab'))) {
                                // Replacement for Print-Safe Colors
                                if (prop === 'color') {
                                    if (el.classList.contains('gold-text')) el.style.color = '#FFB411'
                                    else el.style.color = '#FFFFFF'
                                }
                                if (prop === 'backgroundColor') {
                                    if (el.classList.contains('glass')) el.style.backgroundColor = 'rgba(255,255,255,0.08)'
                                    else if (el.classList.contains('gold-gradient')) el.style.backgroundColor = '#FFB411'
                                    else el.style.backgroundColor = 'transparent'
                                }
                                if (prop.includes('Color')) el.style.borderColor = 'rgba(255,255,255,0.12)'
                            }
                        })
                    }

                    // 3. Fix Gradient Overlays (The "Orange Box" Issue)
                    const fixGradients = clonedDoc.querySelectorAll('.gold-text, .gold-gradient')
                    fixGradients.forEach(el => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.backgroundImage = 'none'
                        htmlEl.style.background = 'transparent'
                        htmlEl.style.webkitBackgroundClip = 'initial'
                        htmlEl.style.backgroundClip = 'initial'
                        htmlEl.style.webkitTextFillColor = 'initial'
                        if (el.classList.contains('gold-text')) {
                            htmlEl.style.color = '#FFB411'
                        } else {
                            htmlEl.style.backgroundColor = '#FFB411'
                        }
                    })

                    // 4. Refine Glass Effects for Print
                    const glasses = clonedDoc.querySelectorAll('.glass')
                    glasses.forEach(el => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.backdropFilter = 'none'
                        htmlEl.style.webkitBackdropFilter = 'none'
                        htmlEl.style.background = 'rgba(255, 255, 255, 0.08)'
                        htmlEl.style.border = '1px solid rgba(255, 255, 255, 0.15)'
                    })

                    // 5. Hide Interactive Components
                    const toHide = clonedDoc.querySelectorAll('.no-print')
                    toHide.forEach(el => (el as HTMLElement).style.display = 'none')
                }
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.98)
            const pdf = new jsPDF('p', 'mm', 'a4')

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            const margin = 10
            const contentWidth = pdfWidth - (margin * 2)
            const imgProps = pdf.getImageProperties(imgData)
            const imgHeightInPdf = (imgProps.height * contentWidth) / imgProps.width

            let heightLeft = imgHeightInPdf
            let position = margin

            // Add Pages with Header/Footer Padding
            pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInPdf)
            heightLeft -= (pdfHeight - margin * 2)

            while (heightLeft > 0) {
                // Adjust position for new page with slightly more padding at top
                position = heightLeft - imgHeightInPdf + (margin * 2)
                pdf.addPage()
                // Recolor background of new page to match maroon
                pdf.setFillColor(42, 7, 8) // #2A0708
                pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')
                pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInPdf)
                heightLeft -= (pdfHeight - margin * 2)
            }

            pdf.save('Sách-Gia-Phả-Trần-Tộc-Mỹ-Nguyên.pdf')
            toast.success('Đã xuất Sách Gia Phả nghệ thuật thành công!')
        } catch (error: any) {
            console.error('Error exporting PDF:', error)
            toast.error(`Lỗi xuất PDF: ${error?.message || 'Không xác định'}`)
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
            <div className="shrink-0 px-6 py-4 border-b border-border glass no-print">
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
                        {/* Elegant Header for Print */}
                        <div className="text-center mb-16 relative">
                            <div className="text-7xl mb-8 opacity-90 hero-logo">📖</div>
                            <div className="relative inline-block px-12 py-4">
                                <div className="absolute top-0 left-0 w-12 h-0.5 bg-amber-500/40" />
                                <div className="absolute top-0 right-0 w-12 h-0.5 bg-amber-500/40" />
                                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-amber-500/40" />
                                <div className="absolute bottom-0 right-0 w-12 h-0.5 bg-amber-500/40" />
                                <h2 className="text-4xl font-serif font-extrabold gold-text tracking-[0.15em] uppercase">GIA PHẢ</h2>
                                <h3 className="text-lg font-serif font-medium text-amber-200/60 mt-2 tracking-widest italic">TRẦN TỘC MỸ NGUYÊN</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-8 uppercase tracking-[0.3em] opacity-40">Lưu giữ — Truyền thừa — Phát triển</p>

                            <div className="grid grid-cols-3 gap-12 mt-16 max-w-xl mx-auto">
                                <div className="space-y-1">
                                    <div className="text-2xl font-serif font-bold text-amber-500/80">{stats.total}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Thành viên</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-serif font-bold text-amber-500/80">{stats.gens}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Thế hệ</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-serif font-bold text-amber-500/80">{stats.alive}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Còn sống</div>
                                </div>
                            </div>
                        </div>

                        {/* Family Tree Section */}
                        <div className="space-y-6 mt-16">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/40" />
                                <h3 className="text-[10px] font-semibold text-amber-500/40 uppercase tracking-[0.4em]">Phả Hệ Dòng Tộc</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/40" />
                            </div>
                            {roots.map(branch => (
                                <BranchSection key={branch.member.id} branch={branch} depth={0} />
                            ))}
                        </div>

                        {/* Genealogy Statistics Section */}
                        <div className="mt-24 pt-16 border-t border-border/20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/40" />
                                <h3 className="text-[10px] font-semibold text-amber-500/40 uppercase tracking-[0.4em]">Thống kê Thế hệ</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/40" />
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                {Array.from(new Set(members.map(m => m.generation_level))).sort().map(gen => {
                                    const genMembers = members.filter(m => m.generation_level === gen)
                                    return (
                                        <div key={gen} className="glass rounded-3xl p-8 border border-border/40 break-inside-avoid shadow-2xl">
                                            <div className="flex justify-between items-end mb-6 border-b border-border/10 pb-4">
                                                <div>
                                                    <p className="text-lg font-serif font-semibold text-amber-500">Thế hệ thứ {gen}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Giai đoạn lưu danh</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-serif font-bold text-foreground/20">{genMembers.length}</span>
                                                    <span className="text-[8px] text-muted-foreground ml-2 uppercase tracking-tighter">Nhân khẩu</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                                                {genMembers.map(m => {
                                                    const mMeta = (m.metadata as MemberMetadata) || {}
                                                    return (
                                                        <div key={m.id} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-muted-foreground/30 text-[10px]">{m.gender === 'male' ? '♂' : '♀'}</span>
                                                                <span className="text-sm font-medium text-foreground/80">{m.full_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(mMeta.birth_year || mMeta.death_year) && (
                                                                    <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums">
                                                                        {[mMeta.birth_year, mMeta.death_year].filter(Boolean).join('–')}
                                                                    </span>
                                                                )}
                                                                {mMeta.is_alive === false && <span className="text-[10px] text-amber-600/40">✝</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Footer for Print */}
                        <div className="mt-32 text-center opacity-20 no-screen">
                            <p className="text-[10px] tracking-[0.5em] uppercase">Gia Phả Trần Tộc Mỹ Nguyên — Bản in di sản</p>
                            <p className="text-[8px] mt-2">© {new Date().getFullYear()} — Lưu giữ bởi con cháu đời đời</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media screen {
                    .no-screen { display: none; }
                }
                @media print {
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    )
}
