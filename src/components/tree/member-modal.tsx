"use client";

import { Member, MemberMetadata, Spouse } from "@/lib/types";

interface MemberModalProps {
    member: Member | null;
    spouses: Spouse[];
    isOpen: boolean;
    onClose: (open: boolean) => void;
}

export function MemberModal({ member, spouses, isOpen, onClose }: MemberModalProps) {
    if (!isOpen || !member) return null;

    const meta = (member.metadata as MemberMetadata) || {};
    const memberSpouses = spouses.filter((s) => s.member_id === member.id);
    const lifespan = meta.birth_year
        ? meta.death_year ? `${meta.birth_year} — ${meta.death_year}` : `${meta.birth_year} — nay`
        : "Không rõ";
    const notes = typeof meta.notes === "string" ? meta.notes : undefined;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => onClose(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`Thông tin thành viên ${member.full_name}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-xl border p-6 animate-in fade-in zoom-in-95 duration-200"
                style={{
                    background: "linear-gradient(135deg, #1a0a0f 0%, #0f0808 100%)",
                    borderColor: "rgba(230, 200, 117, 0.2)",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(230, 200, 117, 0.05)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={() => onClose(false)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border transition-colors hover:bg-white/10 cursor-pointer"
                    style={{ borderColor: "rgba(230, 200, 117, 0.2)", color: "#997835" }}
                    aria-label="Đóng thông tin thành viên"
                >
                    ✕
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 overflow-hidden"
                        style={{
                            background: meta.avatar_url
                                ? "transparent"
                                : "linear-gradient(135deg, #997835, #6b5520)",
                            border: "3px solid rgba(230, 200, 117, 0.4)",
                            color: "#e6c875",
                        }}
                    >
                        {meta.avatar_url ? (
                            <img
                                src={meta.avatar_url}
                                alt={member.full_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width={80}
                                height={80}
                            />
                        ) : (
                            member.full_name?.charAt(0)?.toUpperCase() || "?"
                        )}
                    </div>

                    <h2
                        className="text-xl font-serif font-bold text-center"
                        style={{ color: "#e6c875" }}
                    >
                        {member.full_name}
                    </h2>

                    {member.generation_level && (
                        <span
                            className="mt-1 text-xs uppercase tracking-widest"
                            style={{ color: "#997835" }}
                        >
                            Đời thứ {member.generation_level}
                        </span>
                    )}
                </div>

                {/* Info grid */}
                <div className="space-y-3">
                    <InfoRow label="Năm sinh — mất" value={lifespan} />
                    <InfoRow label="Giới tính" value={member.gender === "male" ? "Nam" : "Nữ"} />

                    {/* Spouses */}
                    {memberSpouses.length > 0 && (
                        <div>
                            <p className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "#7a6530" }}>
                                {member.gender === "male" ? "Vợ" : "Chồng"}
                            </p>
                            {memberSpouses.map((s) => (
                                <p key={s.id} className="text-sm pl-2" style={{ color: "#d4b86a" }}>
                                    • {s.full_name}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Notes */}
                    {notes && (
                        <div>
                            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#7a6530" }}>
                                Ghi chú
                            </p>
                            <p className="text-sm leading-relaxed" style={{ color: "#b0a070" }}>
                                {notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span style={{ color: "#7a6530" }}>{label}</span>
            <span style={{ color: "#d4b86a" }}>{value}</span>
        </div>
    );
}
