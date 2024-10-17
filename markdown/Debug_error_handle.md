## Chương 8: Kỹ năng debug xử lý lỗi

- **Lỗi Typescript**: Lỗi liên quan đến kiểu dữ liệu không đúng, có thể bypass bằng any hoặc setting tsconfig
  - Bypass bằng `as any` hoặc `as Type...`
  - Bypass bằng thêm option `--transpileOnly` vào `ts-node` command
- **Lỗi ESLint**: Lỗi liên quan linter, có thể bypass bằng disable eslint
- **Lỗi Node.js**: Đây là lỗi nghiêm trọng liên quan đến code. Không nên bypass lỗi này mà phải xử lý

Cách debug

- Dùng Run and Debug VS Code
- Dùng chat gpt
- Console.log
- Search google
