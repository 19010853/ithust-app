const EXACT_MESSAGES: Record<string, string> = {
  // Phiên đăng nhập / xác thực
  'Token is not available. Please login again.': 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  'Invalid request': 'Yêu cầu không hợp lệ.',
  'Admin access is required.': 'Yêu cầu quyền quản trị viên.',
  'Admin access required.': 'Yêu cầu quyền quản trị viên.',
  'Authentication is required to access this route.': 'Bạn cần đăng nhập để thực hiện thao tác này.',
  'Account is locked. Please contact support.': 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.',
  'Invalid credentials': 'Thông tin đăng nhập không chính xác.',
  'Invalid credentials. Email or Username': 'Email hoặc tên đăng nhập không hợp lệ.',
  'Invalid password': 'Mật khẩu không hợp lệ.',
  'Passwords do not match': 'Mật khẩu xác nhận không khớp.',
  'Reset token has expired': 'Liên kết đặt lại mật khẩu đã hết hạn.',
  'OTP is invalid.': 'Mã OTP không hợp lệ.',
  'Email is invalid': 'Email không hợp lệ.',
  'Verification token is either invalid or is already used.': 'Liên kết xác minh không hợp lệ hoặc đã được sử dụng.',

  // Trạng thái tài khoản / người bán
  'This account is locked.': 'Tài khoản này đã bị khóa.',
  'Withdrawals are disabled for this account.': 'Tài khoản này đã bị khóa nên không thể rút tiền.',
  'This seller cannot create gigs or receive new orders.': 'Người bán này hiện không thể tạo gig hoặc nhận đơn hàng mới.',
  'This gig is currently paused and cannot receive new orders.': 'Gig này đang tạm dừng nên không thể nhận đơn hàng mới.',
  'Seller profile not found.': 'Không tìm thấy hồ sơ người bán.',
  'Seller profile is required.': 'Cần có hồ sơ người bán.',
  'Seller not found': 'Không tìm thấy người bán.',
  'Seller not found.': 'Không tìm thấy người bán.',
  'Seller already exist.': 'Người bán đã tồn tại.',
  'Seller already exist. Go to your account page to update.': 'Hồ sơ người bán đã tồn tại. Vào trang tài khoản để cập nhật.',
  'You are not allowed to manage this seller profile gigs.': 'Bạn không có quyền quản lý gig của hồ sơ người bán này.',
  'You are not allowed to update this gig.': 'Bạn không có quyền cập nhật gig này.',
  'Gig not found.': 'Không tìm thấy gig.',
  'Gig not found': 'Không tìm thấy gig.',
  'Invalid account status': 'Trạng thái tài khoản không hợp lệ.',
  'Invalid account status.': 'Trạng thái tài khoản không hợp lệ.',
  'Invalid seller status': 'Trạng thái người bán không hợp lệ.',
  'User not found': 'Không tìm thấy người dùng.',
  'User not found.': 'Không tìm thấy người dùng.',
  'Reason is required.': 'Cần nhập lý do.',
  'You can only view your own orders.': 'Bạn chỉ có thể xem đơn hàng của chính mình.',

  // Rút tiền / Stripe payout
  'Insufficient available balance': 'Số dư khả dụng không đủ.',
  'Invalid withdrawal amount': 'Số tiền rút không hợp lệ.',
  'Invalid withdrawal status filter': 'Bộ lọc trạng thái rút tiền không hợp lệ.',
  'Withdrawal amount is outside configured payout limits.': 'Số tiền rút vượt quá giới hạn cho phép mỗi lần rút.',
  'Withdrawal is not pending or does not exist': 'Yêu cầu rút tiền không tồn tại hoặc không ở trạng thái chờ xử lý.',
  'Stripe automatic payout is disabled.': 'Tính năng rút tiền tự động qua Stripe hiện đang tắt.',
  'Seller must create a Stripe connected account before requesting a withdrawal.':
    'Bạn cần tạo tài khoản Stripe Connect trước khi rút tiền.',
  'Seller must complete Stripe onboarding/KYC before requesting a withdrawal.':
    'Bạn cần hoàn tất xác minh KYC trên Stripe trước khi rút tiền.',
  'Seller must add a bank account or debit card in Stripe before requesting a withdrawal.':
    'Bạn cần thêm tài khoản ngân hàng hoặc thẻ ghi nợ trong Stripe trước khi rút tiền.',
  'Stripe has not enabled payouts for this seller yet.': 'Stripe chưa bật tính năng payout cho người bán này.',
  'Seller is not eligible for Stripe payouts yet.': 'Người bán chưa đủ điều kiện nhận payout từ Stripe.',
  'Stripe secret key is not configured.': 'Chưa cấu hình khóa bí mật Stripe.',
  'Stripe webhook signature or raw body is missing.': 'Thiếu chữ ký hoặc dữ liệu webhook Stripe.',

  // Đơn hàng / tranh chấp / hoàn tiền
  'Order not found.': 'Không tìm thấy đơn hàng.',
  'Order funds are no longer held.': 'Tiền của đơn hàng này không còn được giữ (đã giải ngân hoặc hoàn tiền).',
  'Order cannot be approved because funds are not held or delivery is not ready.':
    'Không thể duyệt đơn vì tiền chưa được giữ hoặc đơn chưa được bàn giao.',
  'Order cannot be delivered because funds are not held or the order is closed.':
    'Không thể bàn giao vì tiền chưa được giữ hoặc đơn đã đóng.',
  'Order delivery date can only be extended for active held orders before the current deadline.':
    'Chỉ có thể gia hạn giao hàng cho đơn đang hoạt động, còn giữ tiền và trước hạn giao hiện tại.',
  'Order delivery extension cannot be approved for this order.': 'Không thể duyệt gia hạn giao hàng cho đơn này.',
  'Order delivery extension cannot be rejected for this order.': 'Không thể từ chối gia hạn giao hàng cho đơn này.',
  'Only the buyer can request a refund for this order.': 'Chỉ người mua mới có thể yêu cầu hoàn tiền cho đơn này.',
  'Only the buyer can open a dispute.': 'Chỉ người mua mới có thể mở tranh chấp.',
  'Automatic refund is only available for Stripe orders.': 'Hoàn tiền tự động chỉ áp dụng cho đơn thanh toán qua Stripe.',
  'Refund is only available for paid orders still held by the platform.':
    'Chỉ hoàn tiền được cho đơn đã thanh toán và tiền vẫn đang được nền tảng giữ.',
  'Buyer refund is only available while rejecting a pending delivery extension request. Overdue orders are refunded automatically and quality refunds must go through admin dispute review.':
    'Người mua chỉ có thể yêu cầu hoàn tiền khi từ chối yêu cầu gia hạn giao hàng đang chờ duyệt. Đơn quá hạn sẽ tự động hoàn tiền, còn hoàn tiền do chất lượng phải qua tranh chấp với admin.',
  'A quality dispute is only available for delivered orders still under review.':
    'Chỉ có thể mở tranh chấp chất lượng cho đơn đã giao và còn trong thời gian xem xét.',
  'The review window has expired.': 'Thời gian xem xét đã hết hạn.',
  'Dispute reason must contain at least 10 characters.': 'Lý do tranh chấp phải có ít nhất 10 ký tự.',
  'Dispute not found.': 'Không tìm thấy tranh chấp.',
  'Dispute is already resolved or does not exist.': 'Tranh chấp đã được xử lý hoặc không tồn tại.',
  'You are not a participant in this dispute.': 'Bạn không phải là người liên quan trong tranh chấp này.',
  'Message body is required.': 'Cần nhập nội dung tin nhắn.',
  'Only admins can create internal notes.': 'Chỉ quản trị viên mới có thể tạo ghi chú nội bộ.',
  'A valid decision and reason are required.': 'Cần có quyết định và lý do hợp lệ.',
  'A future revision deadline is required.': 'Cần có hạn chỉnh sửa trong tương lai.',

  // Tải tệp lên
  'File upload error. Try again': 'Lỗi tải tệp lên. Vui lòng thử lại.',
  'File upload error. Try again.': 'Lỗi tải tệp lên. Vui lòng thử lại.'
};

const formatDigits = (value: string): string => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString('vi-VN') : value;
};

type PatternRule = [RegExp, (match: RegExpMatchArray) => string];

const PATTERN_RULES: PatternRule[] = [
  [/^Stripe account is restricted: (.+)\.$/, (m) => `Tài khoản Stripe đang bị hạn chế: ${m[1]}.`],
  [/^Seller must complete Stripe requirements: (.+)\.$/, (m) => `Người bán cần hoàn tất các yêu cầu sau trên Stripe: ${m[1]}.`],
  [/^Offer price must be at least (\d+) VND$/, (m) => `Giá đề nghị phải tối thiểu ${formatDigits(m[1])} VND`],
  [/^Offer price must be at most (\d+) VND$/, (m) => `Giá đề nghị tối đa là ${formatDigits(m[1])} VND`],
  [/^Gig price must be at least (\d+) VND$/, (m) => `Giá gig phải tối thiểu ${formatDigits(m[1])} VND`],
  [/^Gig price must be at most (\d+) VND$/, (m) => `Giá gig tối đa là ${formatDigits(m[1])} VND`],
  [/^Order price must be at least (\d+) VND$/, (m) => `Giá đơn hàng phải tối thiểu ${formatDigits(m[1])} VND`],
  [/^Order price must be at most (\d+) VND$/, (m) => `Giá đơn hàng tối đa là ${formatDigits(m[1])} VND`]
];

/**
 * Dịch message lỗi tiếng Anh trả về từ backend sang tiếng Việt.
 * Trả về chuỗi rỗng nếu không có message, hoặc message gốc nếu chưa có bản dịch.
 */
export const translateApiErrorMessage = (message?: string | null): string => {
  const value = `${message ?? ''}`.trim();
  if (!value) {
    return '';
  }

  if (EXACT_MESSAGES[value]) {
    return EXACT_MESSAGES[value];
  }

  for (const [pattern, translate] of PATTERN_RULES) {
    const match = value.match(pattern);
    if (match) {
      return translate(match);
    }
  }

  return value;
};
