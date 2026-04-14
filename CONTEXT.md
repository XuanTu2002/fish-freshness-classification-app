
Giao diện (Interface)
App phải có giao diện "Sạch - Nhanh - Tin cậy". Màu sắc chủ đạo nên là Xanh đại dương (Ocean Blue) và Trắng, tạo cảm giác tươi mới và sạch sẽ.
Màn hình chính (Home):
Một nút "Quét cá ngay" (Scan Now) thật lớn ở giữa.
Phía trên là thanh hiển thị lịch sử các lần quét gần nhất để tôi so sánh giá/độ tươi giữa các sạp.
Màn hình phân tích (Analysis):
Khi tôi chụp ảnh, giao diện sẽ xuất hiện một khung quét $224 \times 224$ (đúng chuẩn input của bạn) để nhắc tôi đưa mắt hoặc mang cá vào đúng khung hình.
Hiệu ứng radar quét qua lại để tăng cảm giác "AI đang làm việc".
Màn hình kết quả (Result):
Chỉ số độ tươi: Hiển thị rõ 1 trong 3 trạng thái: Rất tươi (Xanh lá), Tươi (Vàng), hoặc Không tươi (Đỏ).
Thanh niềm tin (Confidence Score): Một thanh phần trăm nhỏ bên dưới (ví dụ: "Độ tin cậy 92%") dựa trên xác suất (Softmax) mà mô hình trả về.
Các tính năng
App sẽ trả ra kết quả trực diện: Highly Fresh (Nên mua ngay), Fresh (Dùng được trong ngày), Not Fresh (Tuyệt đối không mua). Điều này người dùng ra quyết định mua hàng chỉ trong 3 giây.
Hiển thị: App sẽ chồng lớp Heatmap (EigenCAM) lên ảnh con cá tôi vừa chụp. Nếu vùng đỏ tập trung vào mắt cá (trong veo) hoặc mang cá (đỏ tươi), tôi sẽ cực kỳ tin tưởng vào kết quả của App. Nó chứng minh AI không "đoán bừa".
Gợi ý chế biến. Ví dụ, Nếu kết quả là "Fresh" (vừa phải), App có thể gợi ý: "Cá này hợp để kho hoặc làm chả hơn là hấp" để tối ưu hương vị.


