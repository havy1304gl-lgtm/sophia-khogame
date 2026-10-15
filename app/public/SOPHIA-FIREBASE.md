# SOPHIA v9 — đưa kho đề lên online

Bản này dùng Firebase Authentication + Firestore và Netlify Functions. Không upload riêng dist. Mật khẩu được kiểm tra ở máy chủ; Firestore kiểm tra token có quyền, không nhận mật khẩu thô.

## 1. Cập nhật GitHub

Giải nén SOPHIA-GitHub-v9.zip. Mở GitHub Desktop → repository sophia-khogame → Show in Explorer. Sao chép **nội dung** gói vào thư mục repository: netlify.toml nằm ngay gốc, cạnh thư mục app. Không tạo thêm một tầng Source. Không sao chép node_modules, dist, file khóa riêng hoặc .env.local.

Commit với nội dung `Update SOPHIA Firebase v9`, rồi Push origin. Giữ thư mục .git của repository. Nếu repository có file riêng của bạn, không xóa những file đó.

## 2. Firebase project sophia-khogame

- Firebase Console → Authentication → Get started. Không cần bật Google Login; ứng dụng dùng custom token.
- Firestore Database → Create database → chọn vị trí phù hợp và Production mode. Nếu database đã có, giữ nguyên dữ liệu.
- Firestore → Rules: chép toàn bộ file app/firestore.rules, rồi Publish. Không dùng rules cho phép mọi người đọc/ghi.
- Cách thay thế bằng CLI: tại thư mục app, chạy `npx firebase-tools login`, sau đó `npx firebase-tools deploy --only firestore --project sophia-khogame`. Lệnh dùng app/firebase.json để đăng cả Rules và cấu hình index.
- Project settings → Service accounts → Firebase Admin SDK → Generate new private key. Giữ file này ở nơi riêng trên máy, không đưa vào repository và không gửi vào chat.

Firebase Web config công khai của project đã được điền trong app/.env.production. File đó không phải khóa Admin.

## 3. Netlify Environment variables

Trong site Netlify đã nối GitHub, mở Environment variables. Xóa hai biến cũ ADMIN_PASSWORD và PLAYER_PASSWORD sau khi tạo hai biến có tên đúng bên dưới.

| Key | Giá trị |
| --- | --- |
| FIREBASE_PROJECT_ID | sophia-khogame |
| FIREBASE_SERVICE_ACCOUNT_JSON | Toàn bộ nội dung file JSON khóa riêng vừa tải, giữ nguyên JSON và các dấu escape trong private_key |
| SOPHIA_ADMIN_PASSWORD | Mật khẩu quản lý bạn đã chọn |
| SOPHIA_PLAYER_PASSWORD | Mật khẩu vào chơi bạn đã chọn, phải khác mật khẩu quản lý |
| SOPHIA_ACCESS_VERSION | v1 |
| SOPHIA_RATE_LIMIT_SECRET | Chuỗi ngẫu nhiên riêng ít nhất 32 ký tự |

Đánh dấu các mật khẩu, khóa JSON và rate secret là secret. Nếu có tùy chọn Scopes, đặt sáu biến này ở **Functions**; không cần Builds. Nếu tài khoản chỉ có All scopes, dùng All scopes. Không thêm tiền tố VITE_ cho các biến trên. Không ghi chúng vào netlify.toml.

Có thể tự tạo rate secret trên máy bằng Node:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Netlify dùng cấu hình đã đóng gói: Base directory `app`, Build command `npm run build:netlify`, Publish directory `app/dist-netlify` tính từ gốc repository (hoặc `dist-netlify` tương đối với base), Functions `app/netlify/functions`. Không đặt thêm app/app.

Sau khi lưu biến, vào Deploys → Trigger deploy → Deploy project. Nếu lỗi cũ còn lưu, chọn Clear cache and deploy.

### Nếu secret scanning báo mật khẩu xuất hiện trong ExcelJS

Mật khẩu ngắn bằng số có thể trùng một chuỗi số trong thư viện. Kiểm tra đường dẫn và đoạn mã trước; không mặc định bỏ qua cảnh báo. Với bản v9, mật khẩu chỉ đọc từ process.env ở máy chủ, không được chèn vào JavaScript trình duyệt.

Ưu tiên đặt mật khẩu ở Functions scope. Nếu chỉ có All scopes, sau khi xác nhận cảnh báo chỉ là số trùng trong ExcelJS, có thể thêm biến `SECRETS_SCAN_OMIT_KEYS` với giá trị `SOPHIA_ADMIN_PASSWORD,SOPHIA_PLAYER_PASSWORD` ở Builds. Chỉ miễn hai biến này; không tắt toàn bộ quét và không miễn khóa JSON. Không cần ngoại lệ nếu deploy đã qua.

## 4. Kiểm tra sau deploy

- Mở URL site bằng cửa sổ riêng tư: chưa nhập mật khẩu thì chưa thấy kho/game.
- Nhập sai: bị từ chối. Mật khẩu Player: chỉ danh sách và Play, không có CRUD.
- Admin: thêm một bộ đề thử. Mở máy/trình duyệt khác bằng Player: thấy bộ đề đó mà không cần deploy lại.
- Trong Netlify Functions phải có function access. Nếu không có, kiểm tra đã Push đúng v9, thư mục app/netlify/functions/access.ts và netlify.toml.
- Nếu báo cổng đăng nhập chưa kết nối: kiểm tra sáu biến, JSON khóa đúng project, Firestore đã tạo và deploy lại sau khi sửa biến.

Phiên vào chơi tối đa 12 giờ, có nút đăng xuất. Có giới hạn 10 lần thử trong 15 phút trên một địa chỉ mạng; nhiều máy cùng Wi-Fi có thể dùng chung giới hạn.

## 5. Đề cũ và dữ liệu

Admin mở Kho đề → Đưa đề cũ lên online. Nếu đang mở đúng trình duyệt và địa chỉ cũ, dữ liệu IndexedDB được nhận ra. Hoặc mở bản sao toàn kho JSON trong hộp chuyển đề. JSON từng bộ đề được nhập bằng trình nhập đề thông thường. Thử chuyển lại sẽ bỏ qua đề đã chuyển, không tự ghi đè; bản cũ vẫn được giữ.

Câu hỏi chỉ cần nội dung và đáp án. Ảnh/audio/giải thích không bắt buộc; điểm game vẫn ngẫu nhiên. Hỗ trợ câu ngắn, True/False, AB/ABC/ABCD và nhiều đáp án đúng.

Kho đề/thư mục được chia sẻ trên cloud. Trận chơi đang dở, bảng trắng, giao diện và thiết lập nhạc vẫn lưu theo trình duyệt. Link game tự thêm cũng lưu ở máy đó.

Tối đa 500 câu/bộ, payload 40 MB và mỗi file media 10 MB. Media nhúng được chia thành các document Firestore; không cần bật Firebase Storage cho phiên bản này. Bản payload cũ được giữ khi chỉnh sửa, nên theo dõi dung lượng và số lượt đọc/ghi Firebase; không coi đây là lưu trữ miễn phí không giới hạn.

Đổi mật khẩu trong Netlify rồi deploy lại. Phiên cũ còn sống tối đa 12 giờ. Để thu hồi ngay: đổi SOPHIA_ACCESS_VERSION thành v2, đồng thời sửa document `_access/control` field `version` thành v2 trong Firestore Console, rồi deploy. Lần đầu đăng nhập thành công, máy chủ tự tạo document này với v1.

Các hình, nhạc và mã giao diện vẫn là tài nguyên web công khai. Cổng mật khẩu và Rules bảo vệ quyền vào ứng dụng và dữ liệu kho đề.

## Tài liệu chính thức

- [Firebase custom tokens](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
- [Firebase Admin setup](https://firebase.google.com/docs/admin/setup)
- [Firestore Rules và Authentication](https://firebase.google.com/docs/rules/rules-and-auth)
- [Netlify Functions environment variables](https://docs.netlify.com/build/functions/environment-variables/)
- [Netlify secret scanning](https://docs.netlify.com/manage/security/secret-scanning/)

Gói đã được kiểm tra tại máy và bằng Emulator; chưa được xác nhận trên Firebase production/Netlify của bạn. Không có khóa riêng hay mật khẩu thật trong gói.

## Jouer / sử dụng trong lớp

Chọn game Avengers → chọn bộ đề → chọn 2–6 đội và đặt tên/ảnh → Play. Đá thưởng và sự kiện vẫn theo luật game; nút Continue áp dụng kết quả ngay, Undo để hoàn tác. Bảng trắng: Alt+W, hỗ trợ định dạng và sao chép sang Word. Nhạc chỉ bắt đầu sau thao tác của người dùng.

Chơi riêng tại máy: tại thư mục app, chạy npm ci rồi npm run dev:offline. Kho offline nằm trên trình duyệt, không tự đồng bộ Firebase.
