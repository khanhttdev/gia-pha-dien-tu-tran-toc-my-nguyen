import { ImageResponse } from "next/og";
import { getMemberById } from "@/lib/supabase-data";
import { MemberMetadata } from "@/lib/types";

export const alt = "Vinh Danh Thành Viên Trần Tộc Mỹ Nguyên";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const member = await getMemberById(id);

    if (!member) return new ImageResponse(<div>Không tìm thấy</div>);

    const meta = (member.metadata as MemberMetadata) || {};

    return new ImageResponse(
        (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#2a0a0f", // Heritage Maroon
                    backgroundImage: "radial-gradient(circle at 50% 50%, #4a141b 0%, #2a0a0f 100%)",
                    color: "white",
                    padding: "40px",
                    border: "12px solid #e6c875", // Heritage Gold
                }}
            >
                {/* Decorative corners */}
                <div style={{ position: "absolute", top: 20, left: 20, width: 60, height: 60, borderTop: "4px solid #e6c875", borderLeft: "4px solid #e6c875" }} />
                <div style={{ position: "absolute", top: 20, right: 20, width: 60, height: 60, borderTop: "4px solid #e6c875", borderRight: "4px solid #e6c875" }} />
                <div style={{ position: "absolute", bottom: 20, left: 20, width: 60, height: 60, borderBottom: "4px solid #e6c875", borderLeft: "4px solid #e6c875" }} />
                <div style={{ position: "absolute", bottom: 20, right: 20, width: 60, height: 60, borderBottom: "4px solid #e6c875", borderRight: "4px solid #e6c875" }} />

                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "60px", width: "100%" }}>
                    {/* Avatar Container */}
                    <div
                        style={{
                            width: "320px",
                            height: "320px",
                            display: "flex",
                            borderRadius: "32px",
                            overflow: "hidden",
                            border: "6px solid #e6c875",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                            backgroundColor: "#1a0505",
                        }}
                    >
                        {meta.avatar_url ? (
                            <img
                                src={meta.avatar_url}
                                alt={member.full_name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "140px" }}>
                                {member.gender === "male" ? "👨" : "👩"}
                            </div>
                        )}
                    </div>

                    {/* Info Container */}
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ fontSize: "24px", color: "#e6c875", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "10px" }}>
                            Thành Viên Dòng Họ
                        </div>
                        <div style={{ fontSize: "64px", fontWeight: "bold", fontFamily: "serif", borderBottom: "2px solid #e6c875", paddingBottom: "10px", marginBottom: "20px" }}>
                            {member.full_name}
                        </div>
                        <div style={{ display: "flex", flexDirection: "row", gap: "20px", marginBottom: "20px" }}>
                            <div style={{ backgroundColor: "#e6c875", color: "#2a0a0f", padding: "8px 20px", borderRadius: "100px", fontSize: "20px", fontWeight: "bold" }}>
                                Thế hệ {member.generation_level}
                            </div>
                            <div style={{ border: "1px solid #e6c875", color: "#e6c875", padding: "8px 20px", borderRadius: "100px", fontSize: "20px" }}>
                                Con thứ {member.birth_order ?? 1}
                            </div>
                        </div>
                        <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.7)", fontStyle: "italic", lineHeight: 1.4 }}>
                            {meta.notes ? (meta.notes.length > 120 ? meta.notes.substring(0, 120) + "..." : meta.notes) : "Lưu giữ di sản, kết nối muôn đời. Gia phả điện tử Trần Tộc Mỹ Nguyên."}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ position: "absolute", bottom: "60px", right: "60px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ fontSize: "24px", color: "#e6c875", fontWeight: "bold" }}>Trần Tộc Mỹ Nguyên</div>
                    <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }}>giaphatranmn.id.vn</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
