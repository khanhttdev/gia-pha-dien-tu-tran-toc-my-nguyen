import { Member, MemberMetadata, Spouse } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Image from "next/image";

export function MemberProfileModal({
    member,
    spouses,
    isOpen,
    onClose,
}: {
    member: Member | null;
    spouses: Spouse[];
    isOpen: boolean;
    onClose: (open: boolean) => void;
}) {
    if (!member) return null;
    const meta = (member.metadata as MemberMetadata) || {};

    // Lọc danh sách vợ/chồng của member này
    const memberSpouses = spouses.filter(s => s.member_id === member.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* 
        DialogContent setup parameters:
        We use a highly stylized royal layout based on the provided Heritage Image 1 & 2.
      */}
            <DialogContent
                className="max-w-[95vw] sm:max-w-[550px] md:max-w-[700px] border-2 border-[var(--color-heritage-gold)] bg-gradient-to-b from-[#2a0a0f] to-[#1a0505] p-0 overflow-hidden shadow-[0_0_50px_rgba(230,200,117,0.2)] rounded-2xl"
                aria-describedby="member-profile-description"
            >
                <DialogTitle className="sr-only">Hồ sơ thành viên {member.full_name}</DialogTitle>
                <DialogDescription id="member-profile-description" className="sr-only">Chi tiết thông tin cá nhân và quan hệ gia đình</DialogDescription>

                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e6c875' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}
                />

                <div className="relative z-10 p-6 md:p-8 flex flex-col items-center">

                    {/* Header Title FT & Crown */}
                    <div className="flex flex-col items-center justify-center mb-6 w-full">
                        <div className="w-12 h-12 flex items-center justify-center border-y-2 border-[var(--color-heritage-gold)] mb-3">
                            <span className="font-serif text-[var(--color-heritage-gold)] text-xl tracking-widest font-bold">FT</span>
                        </div>
                        <h2 className="font-serif text-[var(--color-heritage-gold)] tracking-widest uppercase text-sm font-bold opacity-90 drop-shadow-md">
                            HỒ SƠ THÀNH VIÊN
                        </h2>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-heritage-gold-dim)] to-transparent mt-4 opacity-50"></div>
                    </div>

                    {/* Main Profile Info (Image 1 Style) */}
                    <div className="w-full flex-col md:flex-row flex items-center md:items-start gap-6 bg-black/20 p-4 border border-[var(--color-heritage-gold)]/20 rounded-xl backdrop-blur-sm shadow-inner min-w-full">

                        {/* Avatar Circle */}
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[var(--color-heritage-gold)] overflow-hidden shrink-0 shadow-[0_0_20px_rgba(230,200,117,0.4)] relative bg-black/50 p-1 flex items-center justify-center">
                            <div className="w-full h-full rounded-full overflow-hidden relative">
                                {meta.avatar_url ? (
                                    <Image src={meta.avatar_url} alt={member.full_name} fill className="object-cover" loading="lazy" />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-6 text-[var(--color-heritage-gold-dim)]/50"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                                )}
                            </div>
                        </div>

                        {/* Basic Info Text */}
                        <div className="flex-1 flex flex-col justify-center text-center md:text-left h-full py-2">
                            <h1 className="font-serif text-2xl md:text-3xl font-bold uppercase text-[var(--color-heritage-gold)] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tracking-wide mb-1">
                                {member.full_name}
                            </h1>
                            <div className="font-serif text-[var(--color-heritage-gold-dim)] text-sm mb-3">
                                Sinh năm {meta.birth_year || "..."} - {meta.death_year || "Nay"}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-[13px] text-white/80 font-mono">
                                <span className="text-[var(--color-heritage-gold)]">👑</span> Dòng dõi: Thế hệ thứ {member.generation_level || "?"}
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-heritage-gold-dim)] to-transparent my-6 opacity-30"></div>

                    {/* Quick Stats Grid (Birth, Death, Spouse Info) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-4 text-center mb-6 px-2">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2 drop-shadow-md">🌟</span>
                            <span className="text-[10px] uppercase tracking-widest text-[var(--color-heritage-gold)] font-bold mb-1">Sinh Trưởng</span>
                            <span className="text-xs text-white/80 font-serif">{meta.birth_year || "Bí ẩn"}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2 drop-shadow-md">🎖️</span>
                            <span className="text-[10px] uppercase tracking-widest text-[var(--color-heritage-gold)] font-bold mb-1">Trạng Thái</span>
                            <span className="text-xs text-white/80 font-serif">{meta.death_year ? "Đã Mất" : "Giới tính: " + (member.gender === 'male' ? "Nam" : member.gender === 'female' ? "Nữ" : "Chưa rõ")}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2 drop-shadow-md">💍</span>
                            <span className="text-[10px] uppercase tracking-widest text-[var(--color-heritage-gold)] font-bold mb-1">Hôn Nhân</span>
                            <span className="text-xs text-white/80 font-serif">{memberSpouses.length > 0 ? `${memberSpouses.length} phu/thê` : "Chưa ghi nhận"}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl mb-2 drop-shadow-md">👑</span>
                            <span className="text-[10px] uppercase tracking-widest text-[var(--color-heritage-gold)] font-bold mb-1">Hậu Duệ</span>
                            <span className="text-xs text-white/80 font-serif">Xem trên cây dòng họ</span>
                        </div>
                    </div>

                    {/* SPOUSES LIST (Image 2 Style) - Hiển thị liên kết vợ chồng nếu có */}
                    {memberSpouses.length > 0 && (
                        <div className="w-full flex-col flex items-center bg-black/30 border border-[var(--color-heritage-gold)]/30 rounded-xl p-4 md:p-5 mb-6 shadow-inner relative overflow-hidden">
                            <h3 className="font-serif text-[var(--color-heritage-gold-dim)] text-[10px] uppercase tracking-[0.2em] font-bold mb-5 z-10">Liên kết Phu / Thê</h3>

                            {/* Line Connector Background Layer */}
                            <div className="absolute top-[60%] left-10 right-10 h-0.5 bg-[var(--color-heritage-gold)]/40 z-0 hidden md:block"></div>

                            <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-3 md:gap-6 z-10 w-full">
                                {/* Current Patriarch/Matriarch */}
                                <div className="flex flex-col items-center bg-[#2a0a0f] p-2 rounded-xl z-10 relative shadow-[0_0_15px_rgba(0,0,0,0.8)] border border-[var(--color-heritage-gold)]/20">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[var(--color-heritage-gold)] overflow-hidden shadow-[0_0_15px_rgba(230,200,117,0.5)] bg-black/60 relative">
                                        {meta.avatar_url ? (
                                            <Image src={meta.avatar_url} alt={member.full_name} fill className="object-cover" />
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-4 text-[var(--color-heritage-gold-dim)]/50"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                                        )}
                                    </div>
                                    <span className="font-serif text-[10px] mt-2 text-[var(--color-heritage-gold)] text-center w-20 truncate">{member.full_name.split(' ').pop()}</span>
                                    <span className="font-mono text-[9px] text-white/50 bg-[var(--color-heritage-gold)]/10 px-1 rounded mt-0.5 text-center">Bản thể</span>
                                </div>

                                {memberSpouses.map((spouse, idx) => {
                                    const sMeta = (spouse.metadata as any) || {};
                                    return (
                                        <div key={spouse.id} className="flex items-center gap-3 md:gap-6 z-10 relative">
                                            {/* Marriage Ring SVG Connector */}
                                            <div className="hidden md:flex flex-col items-center bg-[#1a0505] p-1 rounded-full z-10 relative border border-[var(--color-heritage-gold-dim)] shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[var(--color-heritage-gold)] opacity-90 drop-shadow-[0_0_5px_rgba(230,200,117,1)]">
                                                    <circle cx="8" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                                                    <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                                                </svg>
                                            </div>

                                            {/* Spouse Card */}
                                            <div className="flex flex-col items-center bg-[#2a0a0f] p-2 rounded-xl border border-transparent hover:border-[var(--color-heritage-gold-dim)] transition-colors shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-[var(--color-heritage-gold-dim)] overflow-hidden shadow-inner bg-black/60 relative">
                                                    {sMeta.avatar_url ? (
                                                        <Image src={sMeta.avatar_url} alt={spouse.full_name} fill className="object-cover" />
                                                    ) : (
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full p-3 text-[var(--color-heritage-gold-dim)]/50"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                                                    )}
                                                </div>
                                                <span className="font-serif text-[10px] mt-2 text-[var(--color-heritage-gold-dim)] text-center w-20 truncate">{spouse.full_name}</span>
                                                <span className="font-mono text-[9px] text-white/50 bg-black/40 px-1 rounded mt-0.5 text-center">Phu/Thê {idx + 1}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Biography Text (Image 1 Style) */}
                    <div className="w-full">
                        <h3 className="font-serif text-[var(--color-heritage-gold)] tracking-widest uppercase font-bold text-sm mb-3">
                            Tiểu sử
                        </h3>
                        <div className="text-[13px] md:text-sm leading-relaxed text-white/80 font-serif text-justify px-2 h-auto max-h-[150px] overflow-y-auto custom-scrollbar">
                            {meta.notes ? meta.notes : "Hậu duệ dòng họ trần chưa lưu lại ghi chép tiểu sử chi tiết nào về thành viên này trong gia tộc. Lịch sử vẫn đang chờ được viết tiếp..."}
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
