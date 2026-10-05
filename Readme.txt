====================================================================
               HƯỚNG DẪN SỬ DỤNG - CHIA SẺ ẢNH
====================================================================
3. THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP (THAM KHẢO)
- Do ứng dụng có tích hợp hệ thống Đăng Ký trực tiếp, tính năng này hoàn toàn mở. Bạn có thể tự ĐĂNG KÝ một tài khoản mới bất kỳ (chỉ cần định dạng email hợp lệ và mật khẩu trên 6 ký tự).
- Tài khoản thử nghiệm (nếu đã tạo trước đó): 
  + Email: doandientoan12@gmail.com
  + Mật khẩu: DoAnDienToan@1212
  + Hoặc bạn cứ tự tin bấm "Đăng Ký" để tạo một tài khoản mới tinh!

4. CÁC TÍNH NĂNG CHÍNH VÀ CÁCH SỬ DỤNG
[A] Đăng tải ảnh:
- Nhập thông tin Địa điểm chụp ảnh (BẮT BUỘC, ví dụ: Núi Cấm, Chùa Bà, Tràng An...) để hệ thống lưu vị trí và phục vụ chức năng tìm kiếm khu vực.
- Nhập Ghi chú / Caption mô tả kỷ niệm hoặc cảm nghĩ về bức ảnh.
- Chọn Chủ Đề (Tag) phân loại ảnh: Danh Lam Thắng Cảnh, Di Tích Lịch Sử, Phong Cảnh, Khác.
- Chọn chế độ hiển thị:
  + Nếu CHỌN "Public": Ảnh sẽ được đưa lên Tab "Cộng đồng" cho mọi người cùng chiêm ngưỡng.
  + Nếu KHÔNG CHỌN: Ảnh chỉ xuất hiện ở Tab "Cá nhân" (Private).
- Bấm "Chọn ảnh & Đăng tải" để chọn file ảnh từ máy (JPG, PNG, GIF).

[B] Thư viện ảnh (Các Tab chức năng):
- Tab "Cá nhân": Chỉ hiển thị hình ảnh do chính tài khoản của bạn đăng tải.
- Tab "Cộng đồng": Nơi giao lưu, hiển thị tất cả các ảnh mà mọi người đã chọn Public.

[C] Tương tác & Phân loại:
- Mỗi bức ảnh hiển thị rõ ràng nhãn Địa Điểm Chụp (📍 trên góc ảnh và tiêu đề thẻ) cùng Caption ghi chú.
- Sử dụng ô Tìm Kiếm thông minh để tìm ảnh theo Địa Điểm cụ thể (ví dụ: gõ "núi Cấm", "nui cam", "chùa bà"...), từ khóa Caption hoặc Tên ảnh (hỗ trợ cả tiếng Việt có dấu và không dấu).
- Sử dụng các nút Lọc Chủ Đề (Tất Cả, Danh Lam Thắng Cảnh, Di Tích Lịch Sử, Phong Cảnh, Khác) để xem theo chủ đề mong muốn.
- Tương tác: Thả tim (❤️), bình luận (💬), tải xuống (📥), chia sẻ link và mã QR, xem lượt xem (👁️).
- Sử dụng Bộ lọc sắp xếp để xem ảnh: Mới nhất, Được yêu thích nhất, Xem nhiều nhất, Kích thước nhẹ nhất.

[D] Thùng rác (Quản lý xóa):
- Nếu bạn xóa một ảnh ở Tab Cá nhân, nó sẽ được đưa vào Thùng rác.
- Trong Thùng rác, bạn có thể:
  + Khôi phục ảnh (trở lại Thư viện).
  + Xóa vĩnh viễn (xóa hoàn toàn khỏi máy chủ).
  + Khôi phục tất cả hoặc Dọn sạch Thùng rác cùng một lúc.
- Lưu ý: Thùng rác được quản lý ĐỘC LẬP cho từng tài khoản.

[E] Chia sẻ bằng mã QR (Quét bằng điện thoại):
- Dưới mỗi ảnh có nút biểu tượng QR. Nhấn vào để hiện mã.
- TÍNH NĂNG ĐẶC BIỆT: Nếu bạn đang chạy web qua localhost / 127.0.0.1, ứng dụng sẽ yêu cầu bạn nhập địa chỉ IP mạng LAN (ví dụ 192.168.1.10). 
Việc này giúp biến đổi mã QR sao cho điện thoại của bạn (kết nối cùng WiFi) có thể quét và xem được ảnh. Hãy gõ ipconfig trong CMD để lấy IP này.

5. CẤU TRÚC THƯ MỤC CƠ BẢN
- index.html: Giao diện chính của ứng dụng.
- auth.js: Xử lý Đăng ký, Đăng nhập, Đăng xuất (Firebase Auth).
- storage.js: Giao tiếp với Firebase (Lưu trữ ảnh, đọc dữ liệu thời gian thực).
- gallery.js: Chịu trách nhiệm hiển thị (Render) hình ảnh, Thùng rác, Nút Xóa/Khôi phục.
- search.js: Hệ thống lõi xử lý Bộ lọc, Tìm kiếm, Sắp xếp và chuyển Tab.
- upload.js: Chức năng nén ảnh (canvas) và đẩy file lên máy chủ (Storage/Base64).
- download.js: Tính năng tải ảnh gốc về thiết bị.
- qr.js: Tính năng tạo mã QR bằng thư viện qrious/qrcode.

--- HẾT ---
