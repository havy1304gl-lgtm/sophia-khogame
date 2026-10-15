# SOPHIA English · Kho trò chơi

Bộ dùng chính: `C:\Users\Admin 1\SOPHIA-Games`.

## 1. Chọn đúng thư mục

| Mục | Dùng để làm gì |
| --- | --- |
| `Source` | Mã nguồn React/TypeScript để chỉnh sửa và đưa lên GitHub. Có `netlify.toml` và thư mục `app`. |
| `Netlify` | Bản đã build, có `index.html` ngay bên trong. Dùng để kéo thả lên Netlify. |
| `MO-GAME.cmd` | Chạy bản Source tại máy bằng Node.js. Lần đầu cần mạng để cài thư viện. |
| `BAT-DAU.txt` | Chỉ dẫn ngắn để mở game và upload đúng thư mục. |

Không cần đưa cả thư mục SOPHIA-Games lên hosting. Chọn Source khi nối GitHub; chọn Netlify khi upload bản chạy sẵn. Trong bộ phát hành không có node_modules, cache, cơ sở dữ liệu cá nhân hay bản build cũ.

## 2. Dùng game trong lớp

1. Mở web → **Kho đề / Mở kho đề** ở trang chủ để soạn, nhập và chỉnh đề. Kho này dùng chung với màn chọn đề trong Avengers.
2. Chọn **Kho trò chơi → Play game** ở Avengers.
3. Cảnh mở đầu → **Enter classroom** → kho đề Avengers.
4. Dùng đề mẫu, tạo đề hoặc nhập Excel/JSON. Đề và ván đã có trên cùng trình duyệt vẫn được giữ.
5. Chọn **2–6 đội**, ưu tiên nút 2 hoặc 4 đội. Đổi tên và bấm **Đổi ảnh đội** để chọn nhân vật. Có 6 ảnh, mặc định không trùng; chọn ảnh đang dùng sẽ đổi ảnh giữa hai đội.
6. Chọn số đá, thời gian, theme, vị trí bảng đội và số/chữ trên bục.
7. **Bắt đầu ván** → chọn đá → trả lời → **Show answer** nếu cần → giáo viên chấm **Correct / Incorrect / Partial / Skip**.
8. Trả lời đúng sẽ nhận thưởng hoặc mở sự kiện. Chọn vật phẩm rồi bấm **Continue**; điểm cập nhật ngay trên bảng đội, không có bước chốt điểm phụ. PK và nhiệm vụ áp dụng kết quả ngay khi giáo viên chấm.
9. Có thể gọi sự kiện, PK hoặc nhiệm vụ thủ công; hoàn tác, sửa điểm và kết thúc sớm đều có sẵn.

Bảng đội mặc định dọc bên phải, có thể chuyển sang trái hoặc trên. Captain đã được chuẩn hóa theo phần nhân vật thực, không bị nhỏ do viền ảnh trong suốt. Logo Sophia English hiển thị ở kho game, kho đề và biểu tượng trình duyệt. Bấm bảng đội trong ván để sửa điểm hoặc đổi ảnh, rồi **Lưu thay đổi**. Ảnh đội được giữ khi tải lại trang; Hoàn tác khôi phục thay đổi vừa thực hiện.

## 3. Nhập đề: chỉ bắt buộc câu hỏi và đáp án

Excel dùng sheet đầu tiên, dòng đầu là tên cột:

| question | answer | option_a | option_b | option_c | option_d | explanation |
| --- | --- | --- | --- | --- | --- | --- |
| Name a season. | Spring. | | | | | |
| Which colour means stop? | A | Red | Green | | | |
| Which are seasons? | AC | Spring | Monday | Winter | | Spring and winter are seasons. |

- Bỏ cột `type`: có lựa chọn thì tự nhận trắc nghiệm, không có thì câu trả lời ngắn/mở. Có thể trộn các dạng trong cùng một bộ.
- Trắc nghiệm có 1–4 lựa chọn. `answer` có thể là A, B, AB, AC, ABC, ABCD… tùy đáp án đúng.
- Đúng/sai dùng `type = truefalse`, `answer = true` hoặc `false`.
- `points` có thể bỏ trống. Khi bật thưởng đá ngẫu nhiên, không dùng điểm từng câu cho lượt thưởng thường. Giá trị mặc định 5 phục vụ chế độ điểm cố định, chấm một phần và các lượt PK/nhiệm vụ có điểm câu hỏi.
- `explanation`, `image_url`, `answer_image_url`, `audio_url`, `topic`, `time_seconds` đều tùy chọn. Bỏ thời gian hoặc nhập 0 để dùng thiết lập chung của ván.
- Ảnh/audio có thể gắn trực tiếp lúc soạn. Mỗi tệp tối đa 10 MB. Excel tối đa 5 MB; tối đa 500 câu/bộ đề.
- Nhập → xem trước → Áp dụng → sửa từng câu ngay trong trình soạn → đặt tên → Lưu đề.
- Đề đã lưu có nút xem trước; **Chỉnh sửa đề** chuyển thẳng sang sửa nếu có quyền. Sửa đề mẫu sẽ tạo bản sao.
- **A−/A+** tăng/giảm chữ khi xem/soạn đề. Màn câu hỏi cũng có A−/A+; thanh Giao diện có cỡ chữ câu hỏi.

Dùng **Sao lưu đề + ảnh** để xuất JSON khi cần chuyển ảnh/audio đã gắn sang máy khác. Excel phù hợp dữ liệu chữ và URL; JSON giữ các tệp nhúng trong đề.

## 4. Thưởng và sự kiện

- Mỗi viên đá tương ứng 1 point; đá xuất hiện lần lượt cách nhau 0,8 giây. **Reveal all** hiện ngay; **Collect** tiếp tục.
- Thưởng thường ở ván mới: 1 điểm 12%, 2 điểm 20%, 3 điểm 25%, 4 điểm 20%, 5 điểm 15%, 6 điểm 7%, 12 điểm 1%.
- Các phần thưởng đã bốc trong ván đang lưu không bị bốc lại khi tải lại trang.
- Preset Cân bằng: thưởng thường 60%, sự kiện gốc 24%, tình huống lựa chọn 15%, nhiệm vụ giáo viên 1%. PK mặc định gọi thủ công. Có thể chỉnh tỉ lệ.
- **There must be balance**: chọn 1 → mọi đội mất nửa điểm; chọn 2 → hai đội dẫn đầu mất toàn bộ điểm. Điểm lẻ làm tròn xuống; hòa ở ranh giới hai đội thì theo thứ tự đội trên bảng.
- **Face Thanos** giữ các nhánh anh hùng: +9, +7, mọi đội +3, trừ 5, đổi điểm hoặc mất nửa điểm tùy lựa chọn/nhánh.
- Stark có khiên, +6 hoặc đổi điểm. Portals có +7, mọi đội +3 hoặc đổi điểm. Cargo có +4, +9 hoặc rương rỗng. Mỗi lượt chỉ mở một vật phẩm.
- Khiên chặn các tác động bất lợi được quy định bởi Snap, Strike, Loki; PK và nhiệm vụ dùng luật điểm riêng.
- Bật/tắt hiệu ứng và âm thanh trong thiết lập; nút loa của ván tắt cả nhạc nền và hiệu ứng âm thanh. Có tiếng đá, mở rương, cổng phép, khiên, Snap, Strike, Loki, Assemble, báo 10 giây và chiến thắng.

Nhạc nền dùng **The Avengers.mp3** bạn cung cấp (2 phút 03 giây). Intro bắt đầu ở **1:18**, âm lượng 50%; vào kho đề Avengers và ván chơi hạ dần xuống 13%. Nhạc lặp lại, có nén âm để nền đều hơn. Khi phát audio câu hỏi, nền tự hạ còn một phần tư rồi trở lại khi audio dừng.

- Bấm **Nhạc nền** ở trang chủ hoặc **Giao diện → Nhạc nền Avengers** trong ván để đổi mốc mở đầu, âm lượng hoặc tắt nhạc. Thiết lập được nhớ trên trình duyệt.
- **Phát thử intro** nghe thử đoạn mở đầu; **Dừng thử** dừng bản nghe thử. **Xong** quay lại chế độ nhạc của màn trước.
- Khi mở thẳng bằng link, trình duyệt có thể yêu cầu bấm **Bật nhạc Avengers**. Nhạc dừng khi chuyển sang tab khác và tiếp tục khi quay lại nếu trước đó đang phát.
- Kho game và kho đề chung ở trang chủ không tự phát nhạc. Nút loa trong ván tắt cả nhạc lẫn hiệu ứng. Các hiệu ứng được tạo bằng âm tổng hợp.

## 5. Whiteboard và gửi bài qua Word

- **Alt+W** mở/tắt bảng từ kho game, kho đề hoặc trong ván; Escape đóng.
- Có Arial, Calibri, Times New Roman, Georgia, Verdana, Courier New; cỡ 12–96px; bold/italic/underline; màu chữ, highlight, màu giấy và bullet list.
- Chọn đoạn chữ rồi đổi định dạng. Ctrl+A chọn hết; Ctrl+B/I/U dùng trực tiếp trong bảng.
- Kéo góc dưới để đổi kích thước bảng, hoặc dùng nút mở rộng. Nội dung tự lưu trên trình duyệt này.
- **Copy all · Word** copy cả chữ và định dạng. Dán sang Word bằng **Keep Source Formatting / Giữ định dạng nguồn**. Font cần có trên máy mở Word.
- Phím của game không tự kích hoạt khi bạn đang gõ trên bảng.

## 6. Chạy ở máy

Cần Node.js 22.13 trở lên. Mở `MO-GAME.cmd` và giữ cửa sổ lệnh khi chơi, rồi vào `http://localhost:5180/`. Ctrl+C trong cửa sổ lệnh để dừng.

Hoặc mở Terminal trong `Source\app`:

```sh
npm ci
npm run dev:netlify -- --port 5180
```

Build lại sau khi sửa:

```sh
npm run typecheck
npm test
npm run build:netlify
```

Bản mới nằm trong `Source\app\dist-netlify`. Khi upload thủ công hãy dùng bản build mới này, không tiếp tục dùng thư mục Netlify cũ nếu bạn vừa sửa code.

## 7. Đưa Source lên GitHub

1. Tạo repository trống.
2. Chọn **Add file → Upload files**.
3. Đưa **nội dung bên trong Source** lên repository, giữ cấu trúc `app/` và `netlify.toml` ở gốc. Không upload file ZIP như mã nguồn.
4. Commit thay đổi.
5. Khi cập nhật nhiều file cũ, nên dùng GitHub Desktop hoặc Git để đồng bộ cả file thêm/sửa/xóa.

GitHub giới hạn upload qua web ở 100 file/lần, 25 MiB/file; nếu bộ nguồn lớn hơn sau này thì chia lượt hoặc dùng GitHub Desktop. [Hướng dẫn GitHub chính thức](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## 8. Nối GitHub với Netlify

1. Trong Netlify: **Add new project → Import an existing project → GitHub**.
2. Chọn repository vừa tạo, cấp quyền cho đúng repository.
3. Dùng cấu hình có sẵn trong `netlify.toml`:

| Thiết lập | Giá trị |
| --- | --- |
| Base directory | `app` |
| Build command | `npm run build:netlify` |
| Publish directory | `dist-netlify` |

4. Chọn Publish. Khi có URL, mở thử bằng cửa sổ trình duyệt khác. Nếu cần cho học sinh truy cập công khai, kiểm tra quyền truy cập project của nhóm Netlify.
5. Các lần đẩy code tiếp theo sẽ tạo bản deploy mới khi repository đã được kết nối.

[Netlify: deploy từ repository](https://docs.netlify.com/start/quickstarts/deploy-from-repository/) · [Netlify: Vite và cấu hình build](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/). Giao diện có thể đổi tên theo thời gian; các đường dẫn này là tài liệu chính thức để đối chiếu.

## 9. Upload Netlify thủ công

Trong khu deploy thủ công của Netlify, kéo thả **thư mục Netlify có index.html ngay bên trong**. Không kéo cả SOPHIA-Games, không kéo Source và không cần upload node_modules. Bản kéo thả đã được build sẵn, không cần cài Node để upload.

Khi cập nhật, mở đúng project Netlify đang dùng và upload bản build mới vào project đó để giữ địa chỉ web ổn định.

[Netlify: hướng dẫn kéo thả và cập nhật bản deploy](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/).

## 10. Dữ liệu khi chuyển từ máy sang online

Đề, ván chơi, bảng trắng và các link game thêm qua giao diện hiện lưu trong IndexedDB của **từng trình duyệt và từng địa chỉ web**. GitHub/Netlify lưu mã nguồn và tài nguyên của app, không tự đồng bộ các dữ liệu này.

Trước khi chuyển địa chỉ hoặc máy:

1. Mở kho đề cũ, xuất JSON từng bộ đề bằng **Sao lưu đề + ảnh**.
2. Mở web ở địa chỉ mới → Nhập đề Excel/JSON → chọn JSON → đặt tên → lưu.
3. Copy bảng trắng sang Word hoặc sang bảng ở địa chỉ mới nếu muốn chuyển nội dung.
4. Xuất kết quả các ván cần giữ. Ván đang lưu không tự chuyển giữa hai địa chỉ web.

Giữ cùng URL khi cập nhật sẽ tiếp tục dùng dữ liệu trên trình duyệt cũ. Không xóa dữ liệu trang nếu chưa sao lưu. Bản Netlify này không có đăng nhập/kho đề đồng bộ nhiều tài khoản; phần kho online cũ không nằm trong gói triển khai gọn.

Sau khi tải đủ tài nguyên, ván có thể tiếp tục trong tab nếu mất mạng. Chưa có service worker để mở lại website hoàn toàn offline từ đầu.

## 11. Thêm các game tiếp theo

**Cách dùng ngay:** chuyển game mới thành web app, đưa lên hosting riêng, rồi bấm **Thêm game bằng link** tại SOPHIA. Nhập tên, URL và mô tả. Link được nhớ trên trình duyệt này. Xóa link chỉ bỏ nó khỏi danh sách, không xóa game tại hosting.

**Để tất cả người mở SOPHIA đều thấy game mới:** thêm metadata vào `Source/app/lib/game-catalog.ts`, mảng `publishedGameLinks`, rồi build/deploy lại. Ví dụ:

```ts
export const publishedGameLinks: CatalogGame[] = [
  {id:'magic-academy', title:'Magic Academy',
   description:'Your next classroom adventure.',
   url:'https://your-real-game-address.netlify.app/'}
];
```

Dùng địa chỉ game thật của bạn. Đây là ví dụ định dạng, không phải một link game đã được tạo. Mỗi game có thể giữ luật, kho đề và giao diện riêng. Nếu cần gộp thêm game vào cùng mã nguồn/hosting, bổ sung màn chơi trong app và đăng ký nó trong bộ điều hướng của SOPHIA; không cần làm lại Avengers.

## 12. Tệp gốc và dọn thư mục

- Logo dùng từ file bạn gửi, giữ bản gốc và một bản icon nhỏ trong `Source/app/public/brand`.
- Ảnh và luật Avengers có nguồn từ bộ PPT trước đó; prompt ảnh tạo thêm nằm trong `ASSET-PROMPTS.json` ở Source. Ba ảnh đội Sky/Solar/Jade Guardian được tạo mới bằng imagegen, nền trong suốt, tối ưu WebP tại `app/public/assets/guardian-*.webp`.
- Nhạc đúng nằm tại `Source/app/public/audio/avengers-theme.mp3`; file MP3 gốc trong Downloads được giữ nguyên. Natural.mp3 không được đưa vào gói.
- Các thư mục cá nhân, dự án Aura Guild/Magic Academy và file gốc trong Downloads không bị sửa/xóa.
- Source không kèm node_modules; có thể tạo lại bằng npm ci. Thư mục Netlify là bản chạy sẵn, dùng trực tiếp khi upload.
