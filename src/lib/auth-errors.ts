export const getVietnameseAuthError = (message: string) => {
    if (!message) return "Đã xảy ra lỗi không xác định";

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("invalid login credentials")) {
        return "Email hoặc mật khẩu không chính xác";
    }
    if (lowerMessage.includes("user already exists")) {
        return "Người dùng đã tồn tại trong hệ thống";
    }
    if (lowerMessage.includes("invalid format")) {
        return "Định dạng không hợp lệ";
    }
    if (lowerMessage.includes("phone number already exists")) {
        return "Số điện thoại này đã được sử dụng";
    }
    if (lowerMessage.includes("invalid phone number")) {
        return "Số điện thoại không hợp lệ";
    }
    if (lowerMessage.includes("is not confirmed")) {
        return "Tài khoản chưa được xác nhận. Vui lòng kiểm tra email.";
    }
    if (lowerMessage.includes("invalid token") || lowerMessage.includes("expired token")) {
        return "Mã xác thực không đúng hoặc đã hết hạn";
    }
    if (lowerMessage.includes("too many requests")) {
        return "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.";
    }
    if (lowerMessage.includes("network error")) {
        return "Lỗi kết nối mạng. Vui lòng kiểm tra lại.";
    }
    if (lowerMessage.includes("password should be")) {
        return "Mật khẩu phải có ít nhất 6 ký tự";
    }

    return message; // Trả về lỗi gốc nếu không khớp để debug
};
