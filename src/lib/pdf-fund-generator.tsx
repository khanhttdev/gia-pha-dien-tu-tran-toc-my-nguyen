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
        backgroundColor: "#ffffff",
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    titleCol: {
        alignItems: "center",
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 700,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 4,
    },
    heading: {
        fontSize: 20,
        fontWeight: 700,
        textAlign: "center",
        marginBottom: 24,
        color: "#92400e",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottom: "1px solid #f3e8d0",
    },
    summaryCard: {
        padding: 16,
        border: "1px solid #d97706",
        backgroundColor: "#fffbeb",
        marginBottom: 24,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 700,
        marginBottom: 12,
        color: "#92400e",
    },
    signatureRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 64,
    },
    signatureCol: {
        alignItems: "center",
        width: 200,
    },
    tableHeader: {
        backgroundColor: "#fef3c7",
        fontWeight: 700,
    },
});

interface Trx {
    id: string;
    transaction_date: string;
    description: string;
    amount: number;
    transaction_type: "thu" | "chi";
}

interface FundReportPDFProps {
    summary: { totalIncome: number; totalExpense: number; balance: number };
    transactions: Trx[];
}

const formatCurrency = (val: number) => new Intl.NumberFormat("vi-VN").format(val);
const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
};

function FundReportPDFDocument({ summary, transactions }: FundReportPDFProps) {
    const today = new Date();
    const dateStr = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    return (
        <Document title="Bao Cao Thu Chi Quy" author="Ban Quan Ly Gia Pha">
            <Page size="A4" style={styles.page}>
                <View style={styles.headerRow}>
                    <View style={styles.titleCol}>
                        <Text style={styles.title}>BAN QUẢN LÝ QUỸ TỘC</Text>
                        <Text style={styles.subtitle}>GIA PHẢ TRẦN TỘC MỸ NGUYÊN</Text>
                    </View>
                </View>

                <Text style={styles.heading}>BÁO CÁO THU CHI QUỸ DÒNG HỌ</Text>
                <Text style={{ textAlign: "center", marginBottom: 24, fontStyle: "italic", fontSize: 10 }}>
                    {dateStr}
                </Text>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Tổng Quan Tài Chính</Text>
                    <View style={styles.row}>
                        <Text>Tổng thu trong kỳ:</Text>
                        <Text style={{ fontWeight: 700, color: "#10b981" }}>+{formatCurrency(summary.totalIncome)} VNĐ</Text>
                    </View>
                    <View style={styles.row}>
                        <Text>Tổng chi trong kỳ:</Text>
                        <Text style={{ fontWeight: 700, color: "#f43f5e" }}>-{formatCurrency(summary.totalExpense)} VNĐ</Text>
                    </View>
                    <View style={[styles.row, { borderBottom: "none", paddingTop: 12 }]}>
                        <Text style={{ fontWeight: 700 }}>Số dư Tồn quỹ hiện tại:</Text>
                        <Text style={{ fontWeight: 700, fontSize: 14, color: "#d97706" }}>
                            {formatCurrency(summary.balance)} VNĐ
                        </Text>
                    </View>
                </View>

                <Text style={[styles.summaryTitle, { marginTop: 24 }]}>Chi tiết giao dịch gần đây</Text>
                <View style={[styles.row, styles.tableHeader]}>
                    <Text style={{ width: 80 }}>Ngày</Text>
                    <Text style={{ flex: 1 }}>Nội dung</Text>
                    <Text style={{ width: 80, textAlign: "right" }}>Số tiền</Text>
                </View>
                {transactions.map((trx) => (
                    <View key={trx.id} style={styles.row}>
                        <Text style={{ width: 80, fontSize: 10 }}>{formatDate(trx.transaction_date)}</Text>
                        <Text style={{ flex: 1, fontSize: 10 }}>{trx.description}</Text>
                        <Text style={{ width: 80, textAlign: "right", fontSize: 10, color: trx.transaction_type === "thu" ? "#10b981" : "#f43f5e" }}>
                            {trx.transaction_type === "thu" ? "+" : "-"}{formatCurrency(trx.amount)}
                        </Text>
                    </View>
                ))}

                <View style={styles.signatureRow}>
                    <View style={styles.signatureCol}>
                        <Text style={{ fontWeight: 700 }}>Ngưới lập bảng</Text>
                        <Text style={{ fontSize: 9, fontStyle: "italic", marginTop: 4 }}>(Ký và ghi rõ họ tên)</Text>
                    </View>
                    <View style={styles.signatureCol}>
                        <Text style={{ fontWeight: 700 }}>Trưởng Tộc / Xác nhận</Text>
                        <Text style={{ fontSize: 9, fontStyle: "italic", marginTop: 4 }}>(Ký và ghi rõ họ tên)</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export async function generateFundPDF(
    summary: { totalIncome: number; totalExpense: number; balance: number },
    transactions: Trx[]
): Promise<Blob> {
    const blob = await pdf(<FundReportPDFDocument summary={summary} transactions={transactions} />).toBlob();
    return blob;
}
