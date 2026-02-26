'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    ArrowLeft,
    BookOpen,
    Users,
    Search,
    PiggyBank,
    Image as ImageIcon,
    Shield,
    MessageSquare,
    ChevronDown,
    ChevronRight,
    HelpCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const guideSections = [
    {
        id: 'overview',
        title: 'Trang Chủ & Tổng Quan',
        icon: BookOpen,
        content: `
      Màn hình đầu tiên sau khi đăng nhập là **Trang Chủ** (Bảng Tin). Tại đây, bạn sẽ thấy:
      - **Thông báo quan trọng**: Các sự kiện sắp tới như Lễ giỗ, họp họ, hoặc thông báo mới từ Quản trị viên.
      - **Hoạt động mới**: Xem các dòng trạng thái, chia sẻ hình ảnh hoặc tin tức từ các thành viên khác.
      - **Thống kê nhanh**: Số lượng thành viên, tỷ lệ đinh suất, tình hình đóng góp quỹ họ.

      *Mẹo: Bạn có thể viết bài chia sẻ bằng cách nhấp vào ô "Đăng bài mới" ở đầu Bảng tin.*
    `
    },
    {
        id: 'tree',
        title: 'Cây Gia Phả & Sách Gia Phả',
        icon: Users,
        content: `
      Hệ thống cung cấp hai góc nhìn về phả hệ:
      
      **1. Cây Gia Phả (Dạng sơ đồ nhánh):**
      - Thể hiện trực quan mối quan hệ cha-con, vợ-chồng thành cấu trúc cây.
      - **Thao tác**: Dùng chuột (hoặc ngón tay trên điện thoại) để **kéo, thả, phóng to, thu nhỏ**.
      - Bấm vào một Thẻ (Card) để xem thông tin thu gọn. Nhấp "Xem chi tiết" để vào Hồ sơ cụ thể.

      **2. Sách Gia Phả (Dạng danh sách):**
      - Hiển thị theo từng nhóm, ví dụ: Thủy tổ, Chi trưởng, Chi thứ...
      - Dễ tiếp cận nếu bạn muốn theo dõi gia phả dưới dạng tài liệu văn bản truyền thống.
    `
    },
    {
        id: 'search',
        title: 'Tìm Kiếm Thành Viên',
        icon: Search,
        content: `
      Để tìm một người trong họ nhanh chóng:
      - Nhấp chọn **Tra Cứu** trên Menu chính.
      - **Bộ lọc thông minh**: Bạn có thể tìm bằng Tên, Pháp danh, Thế hệ (Đời thứ mấy).
      - Từ kết quả tìm kiếm, nhấp trực tiếp vào tên để xem tiểu sử, ngày sinh/ngày mất (nếu có), nơi an táng.
    `
    },
    {
        id: 'funds',
        title: 'Đóng Góp & Quản Lý Quỹ Họ',
        icon: PiggyBank,
        content: `
      Hệ thống minh bạch hóa toàn bộ việc thu-chi của dòng họ:
      - Tại mục **Quỹ Họ**, bạn sẽ thấy Tổng Quỹ hiện tại, Lịch sử Thu và Lịch sử Chi.
      - Thành viên có thể theo dõi xem các khoản đóng góp của mình/gia đình đã được Thủ quỹ ghi nhận hay chưa.
      - Nếu bạn muốn đóng góp, hệ thống cung cấp mã QR và số tài khoản để ủng hộ nhanh.

      *(Lưu ý: Chỉ Thủ quỹ hoặc Quản trị viên mới có quyền Thêm/Sửa/Xóa các khoản thu/chi).*
    `
    },
    {
        id: 'chat',
        title: 'Trợ Lý AI (Hỏi Đáp Nhanh)',
        icon: MessageSquare,
        content: `
      Góc phải màn hình luôn có **Trợ lý AI**. Bạn có thể đặt bất cứ câu hỏi nào về Gia phả, ví dụ:
      - *"Ông Trần Văn A là ai?"*
      - *"Ngày giỗ ông nội tôi Trần Văn B là ngày bao nhiêu?"*
      - *"Ai nằm ở nghĩa trang Cồn Cát?"*
      
      AI sẽ phân tích toàn bộ dữ liệu Cây gia phả (mà thông thường bạn phải tìm rất lâu) và trả lời ngay tắp lự.
    `
    },
    {
        id: 'gallery',
        title: 'Thư Viện Ảnh',
        icon: ImageIcon,
        content: `
      - Nơi trưng bày các hình ảnh về Lăng Mộ, Nhà Thờ Tộc, và các sự kiện chung.
      - Bấm đúp vào để xem ảnh lớn. Thư viện này giúp lưu truyền những khoảnh khắc vô giá của dòng họ cho đời sau.
    `
    },
    {
        id: 'admin',
        title: 'Phân Quyền (Tài khoản, Biên tập)',
        icon: Shield,
        content: `
      Tùy vào quyền hạn (Role), hệ thống sẽ cho phép các thao tác khác nhau:
      - **Thành viên thường (Member)**: Chờ Ban Quản Trị (BQT) phê duyệt tài khoản mới xem được gia phả. Có quyền Đăng bài, Sửa hồ sơ cá nhân.
      - **Thủ quỹ (Fund Manager)**: Quản lý riêng phần Quỹ Họ (tạo phiếu thu/chi).
      - **Người Quản Lý (Admin)**: Toàn quyền thêm, sửa, xóa thành viên; quản trị bài viết, xem nhật ký hoạt động hệ thống.
    `
    }
]

export function GuidePage() {
    const [activeSection, setActiveSection] = useState<string | null>(guideSections[0].id)

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Header / Hero Area */}
            <div className="relative pt-16 pb-12 border-b border-border/40 bg-card overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                <div className="absolute inset-0 pattern-dots opacity-5" />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <div className="mb-6 flex">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors uppercase tracking-widest font-semibold">
                            <ArrowLeft className="w-4 h-4" /> Về Trang Chủ
                        </Link>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-amber-500/30 text-amber-200 text-xs font-bold uppercase tracking-widest mb-6">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Tài Liệu Xem Thêm
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-serif font-black mb-4">
                        Hướng Dẫn <span className="gold-text">Sử Dụng</span> Hệ Thống
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed font-serif">
                        Tìm hiểu cách khai thác hiệu quả các tính năng trên website Gia phả Điện tử Trần Tộc Mỹ Nguyên để theo dõi cội nguồn và kết nối với người thân.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="py-16 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">

                    {/* Left Sidebar Table of Contents */}
                    <div className="md:col-span-4">
                        <div className="sticky top-24 space-y-2">
                            <h3 className="text-white/80 font-semibold mb-4 uppercase tracking-widest text-sm border-b border-white/10 pb-2">Nội dung hướng dẫn</h3>
                            {guideSections.map(section => {
                                const isActive = activeSection === section.id
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
                                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 translate-x-2'
                                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                                            }`}
                                    >
                                        <section.icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'opacity-60'}`} />
                                        <span className="text-left flex-1">{section.title}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 text-amber-400" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="md:col-span-8">
                        <AnimatePresence mode="wait">
                            {guideSections.map(section => {
                                if (section.id !== activeSection) return null
                                return (
                                    <motion.div
                                        key={section.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-card/50 border border-border/50 rounded-2xl p-6 sm:p-8"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-500">
                                            <section.icon className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-2xl font-serif font-bold text-foreground mb-6">{section.title}</h2>

                                        <div className="prose prose-invert prose-amber max-w-none text-muted-foreground leading-loose prose-strong:text-foreground prose-a:text-amber-400 hover:prose-a:text-amber-300">
                                            {section.content.split('\n').map((line, idx) => {
                                                // Simple markdown-to-html rendering for lists & bold
                                                let html = line
                                                // bold **x**
                                                html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                // italic *x*
                                                html = html.replace(/\*(.*?)\*/g, '<em className="opacity-80">$1</em>')

                                                if (line.trim().startsWith('-')) {
                                                    return <li key={idx} dangerouslySetInnerHTML={{ __html: html.replace('-', '').trim() }} className="ml-4 list-disc marker:text-amber-500" />
                                                }
                                                return <p key={idx} dangerouslySetInnerHTML={{ __html: html }} className="mb-4 last:mb-0" />
                                            })}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            <div className="pb-20 text-center px-6">
                <p className="text-muted-foreground mb-6">Bạn đã nắm rõ cách sử dụng hệ thống?</p>
                <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl gold-gradient text-amber-950 font-bold text-sm shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                    Đăng Ký Thành Viên Ngay
                </Link>
            </div>
        </div >
    )
}
