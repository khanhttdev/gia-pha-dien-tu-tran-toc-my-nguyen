import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, Briefcase, Heart, Baby } from 'lucide-react'
import { Member, Spouse, MemberMetadata } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DetailPanelProps {
    member: Member | null
    spouses: Spouse[]
    isOpen: boolean
    onClose: () => void
}

export function DetailPanel({ member, spouses, isOpen, onClose }: DetailPanelProps) {
    if (!member) return null

    const meta = (member.metadata as MemberMetadata) || {}
    const isAlive = meta.is_alive !== false
    const isMale = member.gender === 'male'

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 h-full w-[400px] z-[150] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col"
                >
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-[#31090A]/85 backdrop-blur-xl border-l border-amber-500/30" />

                    {/* Content Container */}
                    <div className="relative h-full flex flex-col overflow-y-auto custom-scrollbar p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                Thông tin chi tiết
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/5 text-amber-200/50 hover:text-amber-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Section */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className={cn(
                                "w-28 h-28 rounded-3xl border-2 p-1 relative mb-4 shadow-2xl",
                                isMale ? "border-blue-400/50 shadow-blue-500/10" : "border-pink-400/50 shadow-pink-500/10"
                            )}>
                                <div className="w-full h-full rounded-2xl overflow-hidden bg-[#1B0506]">
                                    <img
                                        src={isMale ? "https://img.icons8.com/color/144/circled-user-male-type-7.png" : "https://img.icons8.com/color/144/circled-user-female-type-7.png"}
                                        alt={member.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={cn(
                                    "absolute -bottom-2 -right-2 px-3 py-1 rounded-lg border text-[10px] font-bold shadow-lg",
                                    isAlive ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-zinc-500/20 border-zinc-500/40 text-zinc-400"
                                )}>
                                    {isAlive ? 'CÒN SỐNG' : 'ĐÃ TỪ TRẦN'}
                                </div>
                            </div>

                            <h2 className="text-2xl font-serif text-amber-100 mb-1 tracking-wide">
                                {member.full_name}
                            </h2>
                            <p className="text-amber-500 font-bold tracking-[0.2em] text-xs uppercase">
                                ĐỜI THỨ {member.generation_level}
                            </p>
                        </div>

                        {/* Fast Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                <Calendar size={16} className="text-amber-500/70" />
                                <span className="text-[10px] text-amber-200/40 font-bold uppercase tracking-wider">Ngày sinh</span>
                                <span className="text-sm text-amber-50 font-medium">{String(meta.birth_day || '---')}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                <Baby size={16} className="text-amber-500/70" />
                                <span className="text-[10px] text-amber-200/40 font-bold uppercase tracking-wider">Con thứ</span>
                                <span className="text-sm text-amber-50 font-medium">{member.birth_order ? `Số ${member.birth_order}` : '---'}</span>
                            </div>
                        </div>

                        {/* Detailed List */}
                        <div className="flex flex-col gap-6">
                            {/* Spouses List */}
                            {spouses.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-amber-500/70">
                                        <Heart size={16} />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Phối ngẫu</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {spouses.map(s => (
                                            <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                <div className="w-6 h-6 rounded-full bg-pink-400/20 border border-pink-400/40 flex items-center justify-center text-[10px]">👩</div>
                                                <span className="text-xs text-amber-50 font-medium">{s.full_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Place of Origin */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-amber-500/70">
                                    <MapPin size={16} />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Nguyên quán</h4>
                                </div>
                                <p className="text-xs text-amber-50/70 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 italic">
                                    {String(meta.birth_place || 'Chưa cập nhật dữ liệu...')}
                                </p>
                            </div>

                            {/* Occupation */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-amber-500/70">
                                    <Briefcase size={16} />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Nghề nghiệp / Sự nghiệp</h4>
                                </div>
                                <p className="text-xs text-amber-50/70 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                                    {String(meta.occupation || 'Dữ liệu đang được dòng họ cập nhật...')}
                                </p>
                            </div>
                        </div>

                        {/* Footer Ornament */}
                        <div className="mt-auto pt-8 flex justify-center opacity-20">
                            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
