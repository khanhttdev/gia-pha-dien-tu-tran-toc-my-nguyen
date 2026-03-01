"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
    pdf,
} from "@react-pdf/renderer";
import { Member, Spouse, MemberMetadata } from "@/lib/types";

// Register Google Font for Vietnamese support
Font.register({
    family: "NotoSerif",
    fonts: [
        { src: "https://fonts.gstatic.com/s/notoserifsc/v24/H4chBXePl9DZ0Xe7gG9cyOj7oqPcbX-r0g.ttf", fontWeight: 400 },
        { src: "https://fonts.gstatic.com/s/notoserifsc/v24/H4chBXePl9DZ0Xe7gG9cyOj7oqPcbX-r0g.ttf", fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 48,
        fontFamily: "NotoSerif",
        fontSize: 11,
        color: "#3b2506",
        backgroundColor: "#fffdf7",
    },
    coverPage: {
        padding: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fef3c7",
    },
    coverInner: {
        border: "3px solid #92400e",
        padding: 48,
        margin: 48,
        textAlign: "center",
        width: "100%",
    },
    coverTitle: {
        fontSize: 36,
        fontWeight: 700,
        color: "#92400e",
        letterSpacing: 6,
        marginBottom: 12,
    },
    coverSubtitle: {
        fontSize: 18,
        color: "#78350f",
        letterSpacing: 3,
        marginBottom: 24,
    },
    coverLine: {
        width: 120,
        height: 2,
        backgroundColor: "#d97706",
        marginBottom: 24,
        alignSelf: "center",
    },
    coverMotto: {
        fontSize: 12,
        color: "#a16207",
        fontStyle: "italic",
        letterSpacing: 2,
    },
    coverYear: {
        fontSize: 11,
        color: "#92400e",
        marginTop: 32,
        letterSpacing: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#92400e",
        borderBottom: "2px solid #fbbf24",
        paddingBottom: 6,
        marginBottom: 16,
        letterSpacing: 2,
    },
    genHeader: {
        fontSize: 14,
        fontWeight: 700,
        color: "#78350f",
        backgroundColor: "#fef3c7",
        padding: "6 12",
        marginBottom: 8,
        marginTop: 16,
    },
    memberRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderBottom: "0.5px solid #f3e8d0",
    },
    memberName: {
        fontSize: 11,
        fontWeight: 700,
        color: "#3b2506",
    },
    memberMeta: {
        fontSize: 9,
        color: "#92400e",
    },
    statsCard: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 16,
        padding: 16,
        border: "1px solid #fbbf24",
        borderRadius: 8,
        backgroundColor: "#fffbeb",
    },
    statItem: {
        alignItems: "center",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 700,
        color: "#92400e",
    },
    statLabel: {
        fontSize: 9,
        color: "#a16207",
        letterSpacing: 1,
    },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 48,
        right: 48,
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 8,
        color: "#d97706",
    },
});

type FamilyBranch = {
    member: Member;
    children: FamilyBranch[];
    spouses: Spouse[];
};

function buildFamilyTree(members: Member[], spouses: Spouse[]): FamilyBranch[] {
    const map = new Map<string, Member>(members.map((m) => [m.id, m]));
    const spouseByMember = new Map<string, Spouse[]>();
    spouses.forEach((s) => {
        if (!spouseByMember.has(s.member_id)) spouseByMember.set(s.member_id, []);
        spouseByMember.get(s.member_id)!.push(s);
    });

    const childrenOf = new Map<string, Member[]>();
    members.forEach((m) => {
        if (m.father_id && map.has(m.father_id)) {
            if (!childrenOf.has(m.father_id)) childrenOf.set(m.father_id, []);
            childrenOf.get(m.father_id)!.push(m);
        }
    });

    const hasParent = new Set(
        members.filter((m) => m.father_id && map.has(m.father_id)).map((m) => m.id)
    );
    const roots = members.filter((m) => !hasParent.has(m.id) && m.gender === "male");

    const buildBranch = (m: Member): FamilyBranch => ({
        member: m,
        children: (childrenOf.get(m.id) ?? [])
            .sort((a, b) => (a.birth_order ?? 0) - (b.birth_order ?? 0))
            .map(buildBranch),
        spouses: spouseByMember.get(m.id) ?? [],
    });

    return roots.map(buildBranch);
}

function renderBranch(branch: FamilyBranch, depth: number): any {
    const { member, spouses, children } = branch;
    const meta = (member.metadata as MemberMetadata) || {};
    const yearRange = [meta.birth_year, meta.death_year].filter(Boolean).join("–");
    const indent = depth * 16;

    return (
        <View key={member.id}>
            <View style={[styles.memberRow, { paddingLeft: 12 + indent }]}>
                <View>
                    <Text style={styles.memberName}>
                        {"  ".repeat(depth)}{depth > 0 ? "└ " : ""}{member.full_name}
                        {meta.is_alive === false ? " ✝" : ""}
                    </Text>
                    {spouses.map((s) => (
                        <Text key={s.id} style={[styles.memberMeta, { paddingLeft: 8 }]}>
                            ♥ {s.full_name}
                        </Text>
                    ))}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                    {yearRange && <Text style={styles.memberMeta}>{yearRange}</Text>}
                    <Text style={styles.memberMeta}>Đời {member.generation_level}</Text>
                </View>
            </View>
            {children.map((c) => renderBranch(c, depth + 1))}
        </View>
    );
}

interface GiaPhaPDFProps {
    members: Member[];
    spouses: Spouse[];
}

function GiaPhaPDFDocument({ members, spouses }: GiaPhaPDFProps) {
    const roots = buildFamilyTree(members, spouses);
    const totalMembers = members.length;
    const totalGenerations = new Set(members.map((m) => m.generation_level)).size;
    const alive = members.filter((m) => (m.metadata as MemberMetadata)?.is_alive !== false).length;
    const year = new Date().getFullYear();

    const generationGroups = Array.from(new Set(members.map((m) => m.generation_level)))
        .sort()
        .map((gen) => ({
            gen,
            members: members.filter((m) => m.generation_level === gen),
        }));

    return (
        <Document title="Gia Pha Tran Toc My Nguyen" author="Gia Pha Dien Tu">
            {/* Cover Page */}
            <Page size="A4" style={styles.coverPage}>
                <View style={styles.coverInner}>
                    <Text style={styles.coverTitle}>GIA PHẢ</Text>
                    <Text style={styles.coverSubtitle}>TRẦN TỘC MỸ NGUYÊN</Text>
                    <View style={styles.coverLine} />
                    <Text style={styles.coverMotto}>Lưu giữ — Truyền thừa — Phát triển</Text>
                    <Text style={styles.coverYear}>Năm {year}</Text>
                </View>
            </Page>

            {/* Statistics Page */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>TỔNG QUAN GIA PHẢ</Text>
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalMembers}</Text>
                        <Text style={styles.statLabel}>THÀNH VIÊN</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalGenerations}</Text>
                        <Text style={styles.statLabel}>THẾ HỆ</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{alive}</Text>
                        <Text style={styles.statLabel}>CÒN SỐNG</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalMembers - alive}</Text>
                        <Text style={styles.statLabel}>QUÁ CỐ</Text>
                    </View>
                </View>

                {generationGroups.map(({ gen, members: genMembers }) => (
                    <View key={gen}>
                        <Text style={styles.genHeader}>
                            Thế hệ thứ {gen} — {genMembers.length} người
                        </Text>
                        {genMembers.map((m) => {
                            const mMeta = (m.metadata as MemberMetadata) || {};
                            return (
                                <View key={m.id} style={styles.memberRow}>
                                    <Text style={styles.memberName}>
                                        {m.gender === "male" ? "♂" : "♀"} {m.full_name}
                                        {mMeta.is_alive === false ? " ✝" : ""}
                                    </Text>
                                    <Text style={styles.memberMeta}>
                                        {[mMeta.birth_year, mMeta.death_year].filter(Boolean).join("–")}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
                <View style={styles.footer}>
                    <Text>Gia Phả Trần Tộc Mỹ Nguyên</Text>
                    <Text>© {year}</Text>
                </View>
            </Page>

            {/* Family Tree Page */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>PHẢ HỆ DÒNG TỘC</Text>
                {roots.map((branch) => renderBranch(branch, 0))}
                <View style={styles.footer}>
                    <Text>Gia Phả Trần Tộc Mỹ Nguyên</Text>
                    <Text>© {year}</Text>
                </View>
            </Page>
        </Document>
    );
}

export async function generateGiaPhaPDF(members: Member[], spouses: Spouse[]): Promise<Blob> {
    const blob = await pdf(
        <GiaPhaPDFDocument members={members} spouses={spouses} />
    ).toBlob();
    return blob;
}

export { GiaPhaPDFDocument };
