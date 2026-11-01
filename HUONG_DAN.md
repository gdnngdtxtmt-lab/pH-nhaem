# Website pH Nhà Em – hướng dẫn cài đặt và sử dụng

## Các tệp trong thư mục

| Tệp | Công dụng |
|---|---|
| `index.html` và 13 tệp `.html` khác | 14 trang của website. |
| `noi-dung/` | Nội dung riêng của từng trang. |
| `assets/` | Giao diện chung: menu, banner, chân trang, bảng tin. |
| `admin.html` | Trang quản trị (đăng nhập bằng tên và mật khẩu). Địa chỉ: `/admin` |
| `api/` | Phần máy chủ chạy trên Vercel: kiểm tra mật khẩu, ghi nội dung lên GitHub. |
| `data/content.json` | Nơi lưu nội dung: thông báo, ảnh, bài tập, tài liệu. |
| `uploads/` | Nơi lưu ảnh và tệp tải lên. |
| `vercel.json` | Cho phép gõ `/admin` không cần `.html`, luôn lấy nội dung mới nhất. |

### 14 trang của website (giống menu Google Site)

| Địa chỉ | Trang | Ghi chú |
|---|---|---|
| `/` | Trang chủ | Có **Bảng tin lớp** lấy từ trang admin (thông báo, bài tập, ảnh, tài liệu mới) |
| `/mo-dau` | Mở đầu | |
| `/kien-thuc-bai-hoc` | Kiến thức bài học | |
| `/mo-rong-kien-thuc` | Mở rộng kiến thức | Chưa có mã – tạm dẫn sang Google Site |
| `/ho-tro-hoc-sinh` | Hỗ trợ học sinh | Có Trợ lý AI “Bé pH” |
| `/tien-do-lam-viec` | Tiến độ làm việc | Chưa có mã – tạm dẫn sang Google Site |
| `/trung-bay-san-pham` | Trưng bày sản phẩm | Có **toàn bộ ảnh** đăng từ admin |
| `/quy-tac-an-toan` | Quy tắc an toàn | Chưa có mã – tạm dẫn sang Google Site |
| `/bai-tap` | Bài tập | Có **bài tập** đăng từ admin |
| `/danh-gia` | Đánh giá | |
| `/goc-giao-vien` | Góc giáo viên | |
| `/minh-chung` | Minh chứng | |
| `/tai-lieu-tham-khao` | Tài liệu tham khảo | Có **tài liệu** đăng từ admin |
| `/y-kien-cha-me-hoc-sinh` | Ý kiến cha mẹ học sinh | |
| `/admin` | Trang quản trị | |

Mỗi trang gồm khung chung (thanh menu, banner, chân trang trong `assets/`) và phần nội dung trong thư mục `noi-dung/`.

Mật khẩu và mã GitHub **không nằm trong tệp nào**. Chúng được cất trong phần cài đặt bí mật của Vercel, người xem trang không đọc được.

---

## BƯỚC 1. Đưa tệp lên GitHub

1. Mở kho GitHub đang liên kết với Vercel (kho của trang ph-nhaem.vercel.app).
2. Bấm **Add file → Upload files**.
3. Mở thư mục `phnhaem_web` trên máy, chọn **tất cả** bên trong (các tệp `.html`, `vercel.json`, thư mục `api`, `assets`, `noi-dung`, `data`, `uploads`) rồi kéo vào trang GitHub.
   Kéo **cả thư mục** để GitHub giữ nguyên cấu trúc `api/login.js`, `data/content.json`…
4. Bấm **Commit changes**.

## BƯỚC 2. Tạo mã GitHub cho máy chủ (làm một lần)

1. Mở https://github.com/settings/personal-access-tokens/new
2. **Token name**: `ph-nha-em-vercel` · **Expiration**: chọn 1 năm (hoặc No expiration).
3. **Repository access** → **Only select repositories** → chọn đúng kho website.
4. **Permissions** → **Repository permissions** → **Contents** → chọn **Read and write**.
5. Bấm **Generate token** và **sao chép ngay** mã bắt đầu bằng `github_pat_` (GitHub chỉ hiện một lần).

## BƯỚC 3. Khai báo tài khoản quản trị trên Vercel

1. Mở https://vercel.com → chọn dự án **ph-nhaem** → **Settings** → **Environment Variables**.
2. Thêm lần lượt 7 biến dưới đây. Mỗi biến: điền **Key**, **Value**, tích cả **Production, Preview, Development**, bấm **Save**.

| Key | Value | Ghi chú |
|---|---|---|
| `ADMIN_USER` | `admin` | Tên đăng nhập |
| `ADMIN_PASS` | `phnhaem123@` | Mật khẩu. Nên đổi sang mật khẩu riêng của cô |
| `SESSION_SECRET` | `Xvtqn1qcKUboiYc69xswOX25Iv5l_Qv1QsJXl5pYDlg` | Chuỗi bí mật để ký phiên đăng nhập, dán nguyên văn |
| `GITHUB_TOKEN` | mã `github_pat_...` ở Bước 2 | |
| `GITHUB_OWNER` | tên tài khoản GitHub | VD `levietha231` (phần đầu trong `github.com/levietha231/ph-nhaem`) |
| `GITHUB_REPO` | tên kho | VD `ph-nhaem` (phần sau dấu `/`) |
| `GITHUB_BRANCH` | `main` | Nếu kho dùng nhánh `master` thì ghi `master` |

3. **Quan trọng:** vào thẻ **Deployments** → bấm dấu **⋯** ở lần triển khai mới nhất → **Redeploy**. Biến mới chỉ có hiệu lực sau khi triển khai lại.

## BƯỚC 4. Đăng nhập và đăng bài

1. Mở **https://ph-nhaem.vercel.app/admin**
2. Tên đăng nhập `admin`, mật khẩu `phnhaem123@` (hoặc mật khẩu cô đã đổi) → **Đăng nhập**.
3. Chọn thẻ cần đăng:

| Thẻ | Điền gì | Hiện trên trang chủ |
|---|---|---|
| 📢 Thông báo | Tiêu đề, nội dung, ngày, đường dẫn (nếu có), tích **Ghim** nếu muốn nằm trên cùng | Mục Thông báo |
| 📸 Ảnh | Chọn một hoặc nhiều ảnh, tiêu đề, mô tả | Mục Ảnh hoạt động (bấm xem ảnh lớn) |
| ✍️ Bài tập | Tên bài, yêu cầu, **dán link** (Google Forms…) hoặc **tải tệp**, hạn nộp | Mục Bài tập (có hạn nộp) |
| 📚 Tài liệu | Tên, mô tả, **dán link** (Drive…) hoặc **tải tệp**, loại tài liệu | Mục Tài liệu |

4. Bấm **💾 Lưu lên trang chủ**. Trang chủ cập nhật sau **khoảng 1 phút**.
5. Sửa hoặc gỡ bài: bấm **Sửa** / **Xóa** ở danh sách bên phải.
6. Dùng máy chung thì bấm **Đăng xuất** khi xong. Phiên đăng nhập tự hết hạn sau 8 giờ.

## Giới hạn và lưu ý

- Ảnh tự nén còn tối đa 1600 px trước khi tải lên.
- Mỗi tệp tải lên tối đa khoảng **3 MB** (giới hạn của Vercel). Tệp lớn hơn (video, PDF dày) hãy đưa lên Google Drive, chia sẻ "Bất kỳ ai có đường liên kết", rồi dán đường dẫn.
- Không đăng ảnh rõ mặt học sinh khi chưa có sự đồng ý của phụ huynh.
- **Đổi mật khẩu:** Vercel → Settings → Environment Variables → sửa `ADMIN_PASS` → Redeploy.

## Gặp lỗi khi đăng nhập

| Thông báo | Cách xử lí |
|---|---|
| Sai tên đăng nhập hoặc mật khẩu | Kiểm tra `ADMIN_USER`, `ADMIN_PASS` trên Vercel; nhớ Redeploy sau khi sửa |
| Chưa cấu hình trên Vercel các biến: … | Thêm đủ các biến được liệt kê, rồi Redeploy |
| Chưa có thư mục api trên website | Thư mục `api` chưa được tải lên GitHub (Bước 1) |
| Mã GITHUB_TOKEN … sai / chưa có quyền ghi | Tạo lại mã ở Bước 2, nhớ chọn Contents: Read and write |
| Không tìm thấy kho hoặc nhánh | Kiểm tra `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` |
