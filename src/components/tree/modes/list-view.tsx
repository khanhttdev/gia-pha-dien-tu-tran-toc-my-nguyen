import { useMemo } from 'react'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function ListView({
    members,
    spouses,
    selectedId,
    onSelect
}: {
    members: Member[],
    spouses: Spouse[],
    selectedId: string | null,
    onSelect: (m: Member) => void
}) {
    // Sort members logically: by generation then by birth order
    const sortedMembers = useMemo(() => {
        return [...members].sort((a, b) => {
            if (a.generation_level !== b.generation_level) {
                return (a.generation_level || 0) - (b.generation_level || 0)
            }
            return (a.birth_order || 99) - (b.birth_order || 99)
        })
    }, [members])

    return (
        <div className="absolute inset-0 pt-36 pb-8 px-4 sm:px-8 overflow-y-auto no-scrollbar bg-secondary/10">
            <div className="max-w-3xl mx-auto space-y-3">
                {sortedMembers.map(member => {
                    const isSelected = selectedId === member.id
                    const meta = (member.metadata as MemberMetadata) || {}
                    const memberSpouses = spouses.filter(s => s.member_id === member.id)

                    return (
                        <div
                            key={member.id}
                            onClick={() => onSelect(member)}
                            className={cn(
                                "glass rounded-xl p-4 transition-all cursor-pointer border shadow-sm flex flex-col sm:flex-row gap-4",
                                isSelected ? "border-amber-500 ring-1 ring-amber-500/50 bg-amber-500/5" : "border-border hover:border-amber-500/30 hover:bg-accent/40"
                            )}
                        >
                            {/* Avatar & Generation Badge */}
                            <div className="flex items-center sm:items-start gap-4 sm:w-1/3">
                                <div className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center text-xl border shrink-0',
                                    member.gender === 'male' ? 'bg-blue-500/10 border-blue-500/30' :
                                        member.gender === 'female' ? 'bg-rose-400/10 border-rose-400/30' : 'bg-muted border-border'
                                )}>
                                    {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'}
                                </div>
                                <div className="space-y-1 mt-1">
                                    <h3 className="font-bold text-base leading-tight">{member.full_name}</h3>
                                    <div className="flex gap-1.5 flex-wrap">
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                            Đời {member.generation_level}
                                        </Badge>
                                        <Badge variant={meta.is_alive !== false ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 font-normal">
                                            {meta.is_alive !== false ? 'Còn sống' : 'Đã mất'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Details (D.O.B, Spouses) */}
                            <div className="flex-1 space-y-2 text-sm text-muted-foreground border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="opacity-70">Năm sinh:</span>
                                        <span className="text-foreground ml-1.5 font-medium">{meta.birth_year || '---'}</span>
                                    </div>
                                    <div>
                                        <span className="opacity-70">Năm mất:</span>
                                        <span className="text-foreground ml-1.5 font-medium">{meta.death_year || '---'}</span>
                                    </div>
                                </div>

                                {memberSpouses.length > 0 && (
                                    <div className="pt-1.5">
                                        <div className="text-xs mb-1.5 opacity-80">💍 Phối ngẫu ({memberSpouses.length}):</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {memberSpouses.map(s => {
                                                const sMeta = (s.metadata as MemberMetadata) || {}
                                                return (
                                                    <div key={s.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-md text-xs">
                                                        <span className="font-medium">{s.full_name}</span>
                                                        {sMeta.birth_year && <span className="opacity-70">({sMeta.birth_year})</span>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {sortedMembers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-background/50 rounded-xl border border-dashed border-border">
                        Không có dữ liệu thành viên trong nhánh này.
                    </div>
                )}
            </div>
        </div>
    )
}
