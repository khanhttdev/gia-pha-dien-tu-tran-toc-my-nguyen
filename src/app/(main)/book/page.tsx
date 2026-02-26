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
    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join('\u2013')

    return (
        <div className={cn(
            'border-l-2 pl-4 mb-4 break-inside-avoid',
            depth === 0 ? 'border-amber-500/60' : depth === 1 ? 'border-amber-400/30' : 'border-border/40'
        )}>
            <div className="flex items-start gap-3 mb-2">
                <button
                    className="mt-0.5 text-muted-foreground hover:text-foreground no-print"
                    onClick={() => setOpen(!open)}
                    aria-label={open ? 'Thu g\u1ECDn' : 'M\u1EDF r\u1ED9ng'}
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
                        {meta.is_alive === false && <span className="text-xs text-muted-foreground/60 italic">{'\u271D'}</span>}
                    </div>
                    {spouses.map(s => {
                        const sMeta = (s.metadata as MemberMetadata) || {}
                        return (
                            <p key={s.id} className="text-xs text-muted-foreground mt-0.5">
                                {'\u2665'} <span className="font-medium">{s.full_name}</span>
                                {sMeta.birth_year && <span className="ml-1">({[sMeta.birth_year, sMeta.death_year].filter(Boolean).join('\u2013')})</span>}
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

// CSS override to inject into cloned DOM for PDF export.
// This forces ALL colors to sRGB-safe values, preventing html2canvas
// from encountering unsupported oklab/oklch/lab color functions.
const PDF_OVERRIDE_CSS = `
/* === NUCLEAR COLOR RESET FOR PDF EXPORT === */
/* Force color-scheme to prevent browser oklab interpolation */
:root {
    color-scheme: light !important;
    forced-color-adjust: none !important;
}
/* Re-declare ALL CSS custom properties as pure HSL (sRGB-safe) */
:root, *, *::before, *::after {
    --background: 351 69% 11% !important;
    --foreground: 0 0% 100% !important;
    --card: 351 45% 16% !important;
    --card-foreground: 0 0% 100% !important;
    --popover: 351 45% 14% !important;
    --popover-foreground: 0 0% 100% !important;
    --primary: 40 100% 66% !important;
    --primary-foreground: 0 0% 11% !important;
    --secondary: 351 40% 20% !important;
    --secondary-foreground: 0 0% 100% !important;
    --muted: 351 40% 20% !important;
    --muted-foreground: 0 0% 70% !important;
    --accent: 40 100% 66% !important;
    --accent-foreground: 0 0% 11% !important;
    --destructive: 0 84% 60% !important;
    --border: 351 30% 24% !important;
    --input: 351 30% 22% !important;
    --ring: 40 100% 66% !important;
}
/* Nuke Tailwind v4 internal oklab variables */
*, *::before, *::after {
    --tw-ring-color: rgba(251, 191, 36, 0.5) !important;
    --tw-shadow-color: transparent !important;
    --tw-ring-offset-color: #2A0708 !important;
    --tw-gradient-from: transparent !important;
    --tw-gradient-to: transparent !important;
    --tw-gradient-via: transparent !important;
}
/* Glass effect - safe fallback */
.glass {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: rgba(255, 255, 255, 0.08) !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
}
/* Gold text - solid color, no gradient clip */
.gold-text {
    background: transparent !important;
    background-image: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    -webkit-text-fill-color: initial !important;
    color: #FFB411 !important;
}
/* Gold gradient bg - solid color */
.gold-gradient {
    background: #FFB411 !important;
    background-image: none !important;
}
/* Hide interactive-only elements */
.no-print { display: none !important; }
/* Print-optimized typography */
body { font-size: 18px !important; line-height: 1.6 !important; }
h2 { font-size: 48px !important; }
h3 { font-size: 24px !important; }
.text-sm { font-size: 16px !important; }
.text-xs { font-size: 14px !important; }
.text-\[10px\] { font-size: 13px !important; }
.text-\[9px\] { font-size: 12px !important; }
.text-\[8px\] { font-size: 11px !important; }
.text-2xl { font-size: 32px !important; }
.text-lg { font-size: 22px !important; }
.text-base { font-size: 18px !important; }
/* Better spacing for print */
.space-y-6 > * + * { margin-top: 24px !important; }
.pl-4 { padding-left: 20px !important; }
.border-l-2 { border-left-width: 3px !important; }
/* Cards need more padding */
.rounded-3xl { padding: 32px !important; }
.gap-x-12 { column-gap: 48px !important; }
.gap-y-3 { row-gap: 12px !important; }
`

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

            toast.info('\u0110ang chu\u1EA9n b\u1ECB trang in ngh\u1EC7 thu\u1EADt, vui l\u00F2ng \u0111\u1EE3i...', { duration: 3000 })

            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#2A0708',
                windowWidth: 900,
                onclone: (clonedDoc) => {
                    // STEP 0: Inject the nuclear CSS override into cloned DOM
                    const overrideStyle = clonedDoc.createElement('style')
                    overrideStyle.setAttribute('data-pdf-override', 'true')
                    overrideStyle.textContent = PDF_OVERRIDE_CSS
                    clonedDoc.head.appendChild(overrideStyle)

                    // STEP 1: Remove ALL existing stylesheets that contain oklab/oklch rules
                    try {
                        for (const sheet of Array.from(clonedDoc.styleSheets)) {
                            // Skip our own override
                            if ((sheet.ownerNode as Element)?.getAttribute?.('data-pdf-override') === 'true') continue
                            try {
                                const rules = sheet.cssRules || sheet.rules
                                if (!rules) continue
                                for (let i = rules.length - 1; i >= 0; i--) {
                                    const rule = rules[i]
                                    if (rule.cssText && /(oklab|oklch|lab\(|color\(|color-mix)/.test(rule.cssText)) {
                                        sheet.deleteRule(i)
                                    }
                                }
                            } catch { /* Cross-origin or security restricted stylesheet */ }
                        }
                    } catch { /* StyleSheets API unavailable */ }

                    // STEP 2: Force Readable Print Layout
                    const printEl = clonedDoc.querySelector('[data-print-container]') as HTMLElement
                    if (printEl) {
                        printEl.style.width = '800px'
                        printEl.style.padding = '60px 50px'
                        printEl.style.maxWidth = 'none'
                        printEl.style.margin = '0 auto'
                        printEl.style.fontSize = '18px'
                    }

                    // STEP 3: Belt-and-suspenders — Walk every element and force-override
                    // any computed style that still resolves to a modern color function
                    const allElements = clonedDoc.getElementsByTagName('*')
                    const colorRegex = /(oklab|oklch|lab\(|color\(|color-mix)/
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement
                        try {
                            const cs = clonedDoc.defaultView
                                ? clonedDoc.defaultView.getComputedStyle(el)
                                : window.getComputedStyle(el)

                            // Check color properties
                            const colorVal = cs.color
                            if (colorVal && colorRegex.test(colorVal)) {
                                el.style.setProperty('color', '#FFFFFF', 'important')
                            }
                            const bgVal = cs.backgroundColor
                            if (bgVal && colorRegex.test(bgVal)) {
                                el.style.setProperty('background-color', 'transparent', 'important')
                            }
                            const borderVal = cs.borderColor
                            if (borderVal && colorRegex.test(borderVal)) {
                                el.style.setProperty('border-color', 'rgba(255,255,255,0.12)', 'important')
                            }
                            const shadowVal = cs.boxShadow
                            if (shadowVal && colorRegex.test(shadowVal)) {
                                el.style.setProperty('box-shadow', 'none', 'important')
                            }
                            const outlineVal = cs.outlineColor
                            if (outlineVal && colorRegex.test(outlineVal)) {
                                el.style.setProperty('outline-color', 'transparent', 'important')
                            }
                        } catch { /* getComputedStyle may fail on detached elements */ }
                    }
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

            pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInPdf)
            heightLeft -= (pdfHeight - margin * 2)

            while (heightLeft > 0) {
                position = heightLeft - imgHeightInPdf + (margin * 2)
                pdf.addPage()
                pdf.setFillColor(42, 7, 8)
                pdf.rect(0, 0, pdfWidth, pdfHeight, 'F')
                pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInPdf)
                heightLeft -= (pdfHeight - margin * 2)
            }

            pdf.save('S\u00E1ch-Gia-Ph\u1EA3-Tr\u1EA7n-T\u1ED9c-M\u1EF9-Nguy\u00EAn.pdf')
            toast.success('\u0110\u00E3 xu\u1EA5t S\u00E1ch Gia Ph\u1EA3 ngh\u1EC7 thu\u1EADt th\u00E0nh c\u00F4ng!')
        } catch (error: unknown) {
            console.error('Error exporting PDF:', error)
            const msg = error instanceof Error ? error.message : 'L\u1ED7i kh\u00F4ng x\u00E1c \u0111\u1ECBnh'
            toast.error(`L\u1ED7i xu\u1EA5t PDF: ${msg}`)
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
                            <h1 className="text-base font-bold leading-none">S&aacute;ch Gia Ph&#7843;</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Tr&#7847;n T&#7897;c M&#7929; Nguy&ecirc;n &mdash; t&#7921; &#273;&#7897;ng t&#7841;o t&#7915; d&#7919; li&#7879;u</p>
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
                            <span className="hidden sm:inline">Xu&#7845;t PDF</span>
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
                            <div className="text-7xl mb-8 opacity-90 hero-logo">{'\uD83D\uDCD6'}</div>
                            <div className="relative inline-block px-12 py-4">
                                <div className="absolute top-0 left-0 w-12 h-0.5 bg-amber-500/40" />
                                <div className="absolute top-0 right-0 w-12 h-0.5 bg-amber-500/40" />
                                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-amber-500/40" />
                                <div className="absolute bottom-0 right-0 w-12 h-0.5 bg-amber-500/40" />
                                <h2 className="text-4xl font-serif font-extrabold gold-text tracking-[0.15em] uppercase">GIA PH&#7842;</h2>
                                <h3 className="text-lg font-serif font-medium text-amber-200/60 mt-2 tracking-widest italic">TR&#7846;N T&#7896;C M&#7928; NGUY&Ecirc;N</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-8 uppercase tracking-[0.3em] opacity-40">L&#432;u gi&#7919; &mdash; Truy&#7873;n th&#7915;a &mdash; Ph&aacute;t tri&#7875;n</p>

                            <div className="grid grid-cols-3 gap-12 mt-16 max-w-xl mx-auto">
                                <div className="space-y-1">
                                    <div className="text-2xl font-serif font-bold text-amber-500/80">{stats.total}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Th&agrave;nh vi&ecirc;n</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-serif font-bold text-amber-500/80">{stats.gens}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Th&#7871; h&#7879;</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl font-serif font-bold text-amber-500/80">{stats.alive}</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">C&ograve;n s&#7889;ng</div>
                                </div>
                            </div>
                        </div>

                        {/* Family Tree Section */}
                        <div className="space-y-6 mt-16">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/40" />
                                <h3 className="text-[10px] font-semibold text-amber-500/40 uppercase tracking-[0.4em]">Ph&#7843; H&#7879; D&ograve;ng T&#7897;c</h3>
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
                                <h3 className="text-[10px] font-semibold text-amber-500/40 uppercase tracking-[0.4em]">Th&#7889;ng k&ecirc; Th&#7871; h&#7879;</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/40" />
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                {Array.from(new Set(members.map(m => m.generation_level))).sort().map(gen => {
                                    const genMembers = members.filter(m => m.generation_level === gen)
                                    return (
                                        <div key={gen} className="glass rounded-3xl p-8 border border-border/40 break-inside-avoid shadow-2xl">
                                            <div className="flex justify-between items-end mb-6 border-b border-border/10 pb-4">
                                                <div>
                                                    <p className="text-lg font-serif font-semibold text-amber-500">Th&#7871; h&#7879; th&#7913; {gen}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Giai &#273;o&#7841;n l&#432;u danh</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-serif font-bold text-foreground/20">{genMembers.length}</span>
                                                    <span className="text-[8px] text-muted-foreground ml-2 uppercase tracking-tighter">Nh&acirc;n kh&#7849;u</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                                                {genMembers.map(m => {
                                                    const mMeta = (m.metadata as MemberMetadata) || {}
                                                    return (
                                                        <div key={m.id} className="flex items-center justify-between group">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-muted-foreground/30 text-[10px]">{m.gender === 'male' ? '\u2642' : '\u2640'}</span>
                                                                <span className="text-sm font-medium text-foreground/80">{m.full_name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {(mMeta.birth_year || mMeta.death_year) && (
                                                                    <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums">
                                                                        {[mMeta.birth_year, mMeta.death_year].filter(Boolean).join('\u2013')}
                                                                    </span>
                                                                )}
                                                                {mMeta.is_alive === false && <span className="text-[10px] text-amber-600/40">{'\u271D'}</span>}
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
                            <p className="text-[10px] tracking-[0.5em] uppercase">Gia Ph&#7843; Tr&#7847;n T&#7897;c M&#7929; Nguy&ecirc;n &mdash; B&#7843;n in di s&#7843;n</p>
                            <p className="text-[8px] mt-2">&copy; {new Date().getFullYear()} &mdash; L&#432;u gi&#7919; b&#7903;i con ch&aacute;u &#273;&#7901;i &#273;&#7901;i</p>
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
