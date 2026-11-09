# Quy ước xuất đề kho game

Khi tạo hoặc chuyển bộ đề Excel cho kho game trong workspace này, dùng mẫu SOPHIA thống nhất đã được người dùng chọn. Đọc `KHO-GAME-MAU-CHUAN.md` và tham chiếu `outputs/sophia-format/SOPHIA-Mau-Chuan-Kho-Game-v2.xlsx` (thêm cột hint tùy chọn từ 28/10/2026). Không tự đổi sang cấu trúc cột tiếng Việt hay mẫu khác trừ khi người dùng yêu cầu. Giữ nguyên nội dung và đáp án nguồn; kiểm tra tương thích với `app/lib/excel.ts` trước khi giao.

# Quy tắc cố định cho game hiện tại và tương lai

Người dùng chốt ngày 09/11/2026: các quy tắc sau áp dụng cho tất cả game có câu hỏi/điểm; **không áp dụng cho nhóm game gọi tên học sinh**. Đây là yêu cầu sản phẩm cố định, phải kiểm tra khi tạo hoặc chỉnh game. Chức năng chỉ áp dụng khi game có cơ chế tương ứng (ví dụ Give chỉ áp dụng cho game có Give).

- **Điểm âm:** mặc định cho phép điểm âm. Có ô tick “Không cho phép điểm âm”; khi bật, mọi thay đổi điểm đều có mức sàn 0. Giáo viên được sửa điểm tùy chỉnh từng đội, nhập số hoặc tăng/giảm nhanh; có hoàn tác thao tác điểm. Luật riêng Mystery Box: bom thường đưa điểm đội đó về 0, Bomb All đưa điểm tất cả đội về 0.
- **Khung câu hỏi phóng to:** đúp chuột câu hỏi/ảnh để mở lớn, con lăn thu phóng. Nếu câu có lựa chọn, được chọn đáp án ngay trong khung lớn và đồng bộ với game. Nếu không có lựa chọn, có nút “Show Answer”. Bấm lựa chọn/nút không tự đóng khung; đúp vào vùng nội dung trống hoặc dùng nút đóng để trở về. Tránh xung đột giữa thao tác trả lời và đúp chuột phóng to/thu nhỏ.
- **Give:** chọn đội nhận rồi chạy animation hộp bay theo đường cong, xoay nhẹ và đáp xuống; mở hộp sau khi đến nơi, rồi hiển thị kết quả và thay đổi điểm rõ ràng. Đội nhận được lợi thì vui/cười, đội gửi tiếc/buồn; đội nhận bất lợi thì buồn, đội gửi vui. Kết quả trung tính hoặc ảnh hưởng toàn bộ đội dùng phản ứng ngạc nhiên phù hợp, không áp biểu cảm thắng/thua sai. Có nhiều biến thể biểu cảm ngẫu nhiên để giảm lặp.
- **Điều khiển animation:** có tốc độ Normal / Fast và nút bỏ qua. Khóa thao tác gây thay đổi ván trong lúc xử lý animation; điểm/kết quả chỉ được áp dụng đúng một lần, kể cả khi bỏ qua hiệu ứng.
- **Quy trình duyệt:** đề xuất trước khi sửa; làm và kiểm tra local để người dùng xem. Chỉ up online sau khi người dùng duyệt bản hoàn thiện đó; không lấy sự đồng ý với ý tưởng làm sự đồng ý triển khai online.
- **Gọn thư mục:** tổ chức code và tài nguyên theo chức năng, tái sử dụng phần chung. Chỉ tự xóa file do agent tạo khi đã xác nhận bị trùng, lỗi hoặc không còn dùng; kiểm tra tham chiếu trước khi xóa. File không do agent tạo hoặc không rõ nguồn gốc phải hỏi người dùng trước. Không xóa dữ liệu lớp, bộ đề hay file nguồn người dùng gửi khi dọn dẹp.
