<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/tree-deciduous.svg" width="80" alt="Gia Phả Icon" />
  <h1>Trần Tộc Mỹ Nguyên - Gia Phả Điện Tử</h1>
  <p>Hệ thống Quản lý Gia phả Toàn diện - Hiện đại - Gắn kết Dòng họ</p>

  <p>
    <a href="https://trantocmynguyen.vercel.app">🌐 Truy cập Ứng dụng</a>
    ·
    <a href="#tính-năng-nổi-bật">✨ Tính năng</a>
    ·
    <a href="#công-nghệ-sử-dụng">💻 Công nghệ</a>
    ·
    <a href="#lịch-sử-thay-đổi-changelog">📜 Changelog</a>
  </p>
</div>

---

## 📖 Giới thiệu

**Gia Phả Điện Tử Trần Tộc Mỹ Nguyên** là một giải pháp số hóa gia phả, nhằm lưu giữ, quản lý và kết nối thông tin các thế hệ trong dòng họ. Khác với sổ sách giấy truyền thống dễ thất lạc và mục nát, hệ thống được xây dựng trên nền tảng đám mây tiên tiến, đáp ứng các tiêu chuẩn bảo mật, đồng thời cung cấp trải nghiệm truy cập cực kỳ mượt mà từ máy tính và điện thoại di động (PWA).

Đặc biệt, ứng dụng hỗ trợ sâu cả **cây gia phả nội tộc** và mở rộng các mối quan hệ qua **phối ngẫu (vợ/chồng)**, tự động vẽ sơ đồ, quản lý quỹ họ, sự kiện và cung cấp **Sách Gia Phả kĩ thuật số (PDF)** sẵn sàng đem in ấn.

---

## ✨ Tính năng nổi bật

### 1. 🌳 Cây Gia Phả Tương Tác (Interactive Tree)
- Vẽ sơ đồ phả hệ dạng luồng 2D linh hoạt, hỗ trợ kéo thả, zoom-in/out.
- Bấm vào từng cá nhân để xem Hồ sơ chi tiết (Tiểu sử, sự nghiệp, vai trò họ tộc).
- Cấu trúc dữ liệu đa phả hệ: Xử lý quan hệ Đinh (Nam giới) và Thông gia tự động kết nối bằng giải thuật Graph BFS mở rộng.

### 2. 📱 Progressive Web App & Mobile First
- Ứng dụng có thể cài đặt trực tiếp vào màn hình chính của iPhone/Android (Không qua App Store/Google Play).
- **Offline Mode**: Cache dữ liệu thông minh, cho phép xem sơ đồ gia phả ngay cả khi mất sóng Internet hoặc đi viếng mộ.
- **Web Push Notifications**: Gửi thông báo theo thời gian thực về sự kiện, cúng giỗ, hoặc Bảng tin họ.
- **Camera Access**: Mở camera trực tiếp trong app để scan/chụp ảnh tư liệu mộc nhanh chóng.

### 3. 📄 Sách Gia Phả Kỹ Thuật Số (Export PDF)
- Render danh sách đinh, cấu trúc cành nhánh dưới dạng thiết kế khổ giấy **A4** tuyệt đẹp.
- Sử dụng mô hình Client-side rendering (jspdf + html2canvas) giúp **Xuất file PDF chất lượng cao** đóng thành sách ngay lập tức mà không cần qua Server.

### 4. 🔄 Cổng Import Chuẩn Bằng GEDCOM
- Tương thích định dạng quy chuẩn quốc tế **.ged** (GEDCOM).
- Chuyển đổi, Parse cấu trúc text phức tạp và nhập thẳng vào Hệ thống tự động thiết lập toàn bộ Quan hệ theo chiến lược chống trùng lặp dữ liệu (Skip & Overwrite). 

### 5. 💬 Bảng Tin Dòng Họ & Sự Kiện
- Hoạt động như một mạng xã hội thu nhỏ cho dòng họ: Đăng Bảng tin, hình ảnh, comment chéo gữa các thành viên.
- Phân hệ Sự kiện: Ngày họp họ, ngày Giỗ các Bác/Cụ.

### 6. 📈 Bảng Điều Khiển Ban Quản Trị (Admin Dashboard)
- **Kiểm soát người dùng**: Phê duyệt hoặc từ chối đơn đăng ký tham gia gia phả. Set Role cho Ban quản trị hoặc phân quyền Thủ quỹ.
- **Quản lý Tài chính quỹ họ**: Nhập liệu công khai minh bạch Khoản Thu - Chi.
- **Analytics Board**: Bảng biểu đồ phân bổ Độ tuổi nhân khẩu học bằng Bar Chart cực trực quan.

### 7. 🤖 Cơ Chế AI Thông Minh Tích Hợp
- Trợ lý AI (Mei Tran) đóng vai trò tư vấn quy tắc gia tốc, tìm kiếm ngữ nghĩa, và trích xuất dữ liệu tự động.

---

## 💻 Công nghệ Sử dụng

Hệ thống được thiết kế theo tư duy Module hóa, Full-Stack TypeScript mang tới hiệu suất tối ưu và 100% Score Lighthouse.

- **Framework:** Next.js 14+ (App Router), React 19
- **Ngôn ngữ:** TypeScript Strict Mode
- **Giao diện:** Tailwind CSS v4, Shadcn/UI, Framer Motion (Animations), Glassmorphism Design Theme.
- **Cơ sở Dữ liệu & Auth:** Supabase (PostgreSQL, Row Level Security).
- **Phác họa Sơ đồ Graph:** React Flow.
- **Progressive Web App:** Serwist (Service Worker).
- **Triển khai CI/CD:** Vercel Hosting, Github Actions.

---

## 📜 Lịch sử Thay đổi (Changelog)

### Nhánh Phiên bản Chính
Dưới đây là một số cập nhật nổi bật của nhánh phát triển.

#### 🏷️ v1.1.0 - Sách Gia Phả & PWA Mở Rộng
- `feat(book)`: Bổ sung xuất file PDF từ trình duyệt (Client-side pdf export). Hỗ trợ chuẩn layout in Sách gia phả.
- `feat(pwa)`: Cập nhật Service Worker (`sw.ts`) với chiến lược *CacheFirst* (ảnh, js) và *NetworkFirst* (Supabase query), kích hoạt tính năng chạy App không cần mạng (Offline Mode). Đóng gói API Web Push Notifications.
- `feat(gedcom)`: Viết bộ phân tích dữ liệu Typescript GEDCOM Parser và tích hợp trang nhập liệu cho Admin. Tự động liên kết huyết thống khi up file GEDCOM.
- `chore(fix)`: Thêm `capture="environment"` vào input giúp máy chấm ảnh mobile quét trực tiếp tài liệu từ Camera. Khắc phục triệt để lỗi không nhận thẻ `@vercel/analytics/next`.

#### 🏷️ v1.0.0 - Analytics & Tối Ưu Hệ Thống
- `feat(admin)`: Thêm màn hình Thống kê dữ liệu, Dashboard vẽ biểu đồ Độ tuổi. Hoàn thiện vai trò Thủ quỹ. Phân luồng Cấp phép thành viên mới gia nhập.
- `feat(board)`: Hiển thị bộ đếm tương tác (Lượt Comment) + Box Submit Newsfeed. Cải thiện độ tương phản (Contrast Ratio) trong thẻ đăng nhập.
- `perf(ui)`: Audit toàn cục hệ thống vượt qua bài test 100/100 Lighthouse Performance, A11y, Best Practices và SEO. Sửa lỗi thiếu aria-labels.
- `refactor(db)`: Quy hoạch tối đa Database chuyển đổi cấu trúc phẳng sang bảng `members` và `spouses` kép nhằm mở rộng tìm kiếm đa luồng (Global Search BFS). 

#### 🏷️ v0.8.0 - Bảng Tin & 404 Custom Root
- `feat(setup)`: Phát hành Landing Page đón khách, Trang Chủ thành viên. Config PWA manifest.
- `feat(search)`: Đưa thanh công cụ Command Menu (Global Search - Chữ K) vào vận hành, trỏ query xuyên 4 table (Nhân khẩu, Phối ngẫu, Bảng tin, Sự kiện). Tính toán luồng phả hệ vợ/chồng.

#### 🏷️ v0.5.0 - Nền Tảng Auth & Cơ Sở Dữ Liệu
- Khởi chạy Dự án. Viết các Unit Test Core Module của App như Data-Fetcher của Supabase. Bật Middleware proxy điều hướng truy cập.
- Xây dựng Theme giao diện Di Sản, tách màu nâu hổ phách cổ điển, chuyển đổi bố cục Split Screen siêu hiện đại.

*(Danh sách chi tiết hơn có thể được tìm thấy trong thẻ commit/releases trên GitHub repository).*

---

## 🤝 Hỗ Trợ & Bản Quyền

Dự án này là tâm huyết hướng về cội nguồn nhằm duy trì và lan tỏa kết nối cho hậu duệ dòng tộc. Xin vui lòng không dùng vì các mục đích thương mại vi phạm bản quyền hoặc tấn công phá hoại.

Được phát triển và duy trì bởi đội ngũ Antigravity AI.
