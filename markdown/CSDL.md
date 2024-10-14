## SQL
- Học 1 ngôn ngữ nhưng dùng được ở nhiều cơ sở dữ liệu khác nhau
- Schema chặt chẽ
- Khuyến khích tiêu chuẩn hoá để giảm thiểu dữ liệu dư thừa
- Có thể mở rộng nhưng hơi tốn công

## NoSQL
- Dữ liệu được lưu dưới dạng JSON với cặp key-value
- Không cần Schema, lưu được hầu như bất cứ thứ gì
- Hiệu năng tuyệt vời, mở rộng theo chiều ngang dễ dàng

Việc phân mảnh database sẽ làm cho dev khó có thể quan sát được logic của database, vì càng phân mảnh sẽ càng làm tăng độ phức tạp
==> **Thời gian phát triển ứng dụng bị chậm đi**

Khi chúng ta muốn query để lấy data đầy đủ, chúng ta phải dùng JOIN kết hợp với nhiều bảng liên quan

Áp dụng full-text search cũng khó.
> SQL quá cứng nhắc

## Khi nào nên dùng SQL
- Cần một CSDL chặt chẽ về cấu trúc
- Đã quen thuộc sử dụng SQL

## Khi nào nên dùng NoSQL(MongoDB)
- Khi muốn tích hợp lượng data lớn
- Data có cấu trúc phức tạp
- Khi cần một CSDL có khả năng mở rộng nhanh, rẻ
- Khi cần một CSDL giúp tốc độ phát triển phần mềm nhanh