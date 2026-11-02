# Website pH Nhà Em – hướng dẫn cài đặt và sử dụng

## Các tệp trong thư mục

| Tệp | Công dụng |
|---|---|
| `index.html` và 13 tệp `.html` khác | 14 trang của website. |
| `noi-dung/` | Nội dung riêng của từng trang. |
| `assets/` | Giao diện chung: menu, banner, chân trang, bảng tin. |
| `admin.html` | Trang quản trị (đăng nhập bằng tên và mật khẩu). Địa chỉ: `/admin` |
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

Mã GitHub chỉ được lưu ở dạng **đã mã hóa bằng mật khẩu** (`data/admin-config.json`). Nên dùng mật khẩu dài, khó đoán và chỉ cấp cho mã quyền với đúng một kho.

---

## BƯỚC 1. Đưa tệp lên GitHub

1. Mở kho GitHub đang liên kết với Vercel (kho của trang ph-nhaem.vercel.app).
2. Bấm **Add file → Upload files**.
3. Mở thư mục `phnhaem_web` trên máy, chọn **tất cả** bên trong (các tệp `.html`, `vercel.json`, thư mục `assets`, `noi-dung`, `data`, `uploads`) rồi kéo vào trang GitHub.
   Kéo **cả thư mục** để GitHub giữ nguyên cấu trúc `api/login.js`, `data/content.json`…
4. Bấm **Commit changes**.

## BƯỚC 2. Tạo mã GitHub (làm một lần)

1. Mở https://github.com/settings/personal-access-tokens/new
2. **Token name**: `admin pH Nhà Em` · **Expiration**: chọn 1 năm.
3. **Repository access** → **Only select repositories** → chọn đúng kho website.
4. **Permissions** → **Repository permissions** → **Contents** → **Read and write**.
5. Bấm **Generate token**, sao chép mã bắt đầu bằng `github_pat_`.

## BƯỚC 3. Thiết lập lần đầu trên trang admin (làm một lần)

1. Mở **https://ph-nhaem.vercel.app/admin** → trang hiện khung **Thiết lập lần đầu**.
2. Tên đăng nhập `admin` và mật khẩu `phnhaem123@` đã điền sẵn (có thể đổi).
3. Điền **Tài khoản GitHub**, **Tên kho** (xem trên thanh địa chỉ: github.com/**tài-khoản**/**tên-kho**), nhánh `main`, dán **mã GitHub**.
4. Bấm **Lưu và đăng nhập**.

Trang sẽ **mã hóa mã GitHub bằng mật khẩu** và lưu vào tệp `data/admin-config.json` trong kho. Không cần cài gì trên Vercel.

## BƯỚC 4. Từ lần sau: đăng nhập và đăng bài

1. Mở **/admin**, gõ `admin` / `phnhaem123@` → **Đăng nhập** (dùng được trên mọi máy).
2. Chọn thẻ cần đăng:

| Thẻ | Điền gì | Hiện ở trang |
|---|---|---|
| 📢 Thông báo | Tiêu đề, nội dung, ngày, đường dẫn (nếu có), **Ghim** | Trang chủ – Bảng tin lớp |
| 📸 Ảnh | Một hoặc nhiều ảnh, tiêu đề, mô tả | Trang chủ, Trưng bày sản phẩm |
| ✍️ Bài tập | Tên, yêu cầu, **dán link** hoặc **tải tệp**, hạn nộp | Trang chủ, Bài tập |
| 📚 Tài liệu | Tên, mô tả, **dán link** hoặc **tải tệp**, loại | Trang chủ, Tài liệu tham khảo |

3. Bấm **💾 Lưu lên trang chủ** → website cập nhật sau **khoảng 1 phút**.
4. **Sửa / Xóa** ở danh sách bên phải. **Đổi mật khẩu** ở nút trên cùng.
5. Dùng máy chung thì bấm **Đăng xuất** khi xong.

**Quên mật khẩu?** Vào kho GitHub, xóa tệp `data/admin-config.json`, đợi 1 phút rồi mở lại `/admin` để thiết lập lại.

## Giới hạn và lưu ý

- Ảnh tự nén còn tối đa 1600 px trước khi tải lên.
- Mỗi tệp tải lên tối đa **25 MB**. Tệp lớn hơn (video, PDF dày) hãy đưa lên Google Drive, chia sẻ "Bất kỳ ai có đường liên kết", rồi dán đường dẫn.
- Không đăng ảnh rõ mặt học sinh khi chưa có sự đồng ý của phụ huynh.

## Gặp lỗi

| Thông báo | Cách xử lí |
|---|---|
| Sai tên đăng nhập hoặc mật khẩu | Gõ lại, chú ý chữ hoa/thường |
| Mã GitHub sai hoặc đã hết hạn | Tạo mã mới, đăng nhập rồi bấm **Đổi mật khẩu** và dán mã mới |
| Mã GitHub chưa có quyền ghi | Sửa mã: Contents → Read and write |
| Không tìm thấy kho/nhánh | Kiểm tra tên tài khoản, tên kho, nhánh; mã đã chọn đúng kho |
