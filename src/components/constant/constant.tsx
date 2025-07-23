import { MessageEntity } from "../../common/services/message/message";
import { PatientEntity } from "../../common/services/patient/patient";

export enum SIDE_BAR {
  "USERS_MANAGEMENT" = "/users-management",
  "ROLES_MANAGEMENT" = "/roles-management",
  "PATIENTS_MANAGEMENT" = "/patients-management",
  "MESSAGES_MANAGEMENT" = "/messages-management",
}

export enum MEASSAGE {
  "SAVE" = "Lưu",
  "CREATE" = "Thêm",
  "CANCEL" = "Huỷ",
  "CLOSE" = "Đóng",
  "CONFIRM_DELETE" = "Xác nhận xóa",
  "OK" = "Có",
  "NO" = "Không",
  "DELETE_SUCCESS" = "Xóa thành công",
  "ERROR" = "Có lỗi xảy ra trong quá trình xử lý",
}

export const dataPatients: PatientEntity[] = [
  {
    id: "NVA",
    fullName: "Nguyễn Văn An",
    mobile: "0912345678",
    address: "12 Lê Lợi, Quận 1, TP.HCM",
    department: "Hô hấp",
  },
  {
    id: "TTM",
    fullName: "Trần Thị Mai",
    mobile: "0987654321",
    address: "45 Nguyễn Trãi, Quận 5, TP.HCM",
    department: "Truyền nhiễm",
  },
  {
    id: "LQB",
    fullName: "Lê Quốc Bảo",
    mobile: "0901234567",
    address: "20 Trần Hưng Đạo, Hà Nội",
    department: "Chấn thương chỉnh hình",
  },
  {
    id: "PTH",
    fullName: "Phạm Thị Hương",
    mobile: "0934567890",
    address: "18 Nguyễn Du, TP. Đà Nẵng",
    department: "Nội tổng quát",
  },
  {
    id: "DMT",
    fullName: "Đỗ Minh Tâm",
    mobile: "0961234567",
    address: "75 Hai Bà Trưng, Huế",
    department: "Nội tiết",
  },
  {
    id: "HTL",
    fullName: "Hoàng Thị Lan",
    mobile: "0978123456",
    address: "30 Lý Thường Kiệt, TP. Vinh",
    department: "Sản phụ khoa",
  },
  {
    id: "BCV",
    fullName: "Bùi Văn Cường",
    mobile: "0923456789",
    address: "10 Phan Bội Châu, TP. Cần Thơ",
    department: "Tim mạch",
  },
  {
    id: "VTKN",
    fullName: "Võ Thị Kim Ngân",
    mobile: "0945678910",
    address: "60 Nguyễn Huệ, TP. Nha Trang",
    department: "Da liễu",
  },
  {
    id: "PAT",
    fullName: "Phan Anh Tú",
    mobile: "0932123456",
    address: "33 Lê Duẩn, TP. Huế",
    department: "Tiêu hóa",
  },
  {
    id: "NTY",
    fullName: "Ngô Thị Yến",
    mobile: "0981122334",
    address: "5 Hùng Vương, TP. Hải Phòng",
    department: "Tai - Mũi - Họng",
  },
];

export const dataMessages: MessageEntity[] = [
  {
    content:
      "Nhắc nhở: Anh Nguyễn Văn An có lịch khám tại khoa Hô hấp lúc 08:00 ngày 25/07/2025.",
    time: "07:30 24/07/2025",
    patient: "NVA",
  },
  {
    content:
      "Ưu đãi đặc biệt tháng 7: Giảm 20% phí khám tổng quát tại Bệnh viện Đa khoa.",
    time: "12:45 20/07/2025",
    patient: "NVA",
  },
  {
    content:
      "Anh Nguyễn Văn An vui lòng đến nhận kết quả khám tại quầy tiếp nhận tầng 1.",
    time: "10:15 18/07/2025",
    patient: "NVA",
  },
  {
    content:
      "Bệnh viện gửi lời chúc sức khỏe đến anh Nguyễn Văn An và gia đình!",
    time: "09:00 15/07/2025",
    patient: "NVA",
  },
  {
    content:
      "Khám định kỳ miễn phí công thêm xét nghiệm đường huyết dành cho bệnh nhân Hô hấp.",
    time: "14:30 10/07/2025",
    patient: "NVA",
  },

  {
    content:
      "Chị Trần Thị Mai có lịch tái khám tại khoa Truyền nhiễm lúc 14:00 ngày 26/07/2025.",
    time: "08:00 24/07/2025",
    patient: "TTM",
  },
  {
    content:
      "Thông báo: Kết quả xét nghiệm của chị Trần Thị Mai đã có tại phòng 203.",
    time: "11:15 21/07/2025",
    patient: "TTM",
  },
  {
    content:
      "Bệnh viện triển khai chương trình miễn phí đo huyết áp từ 22–27/07.",
    time: "15:30 19/07/2025",
    patient: "TTM",
  },
  {
    content: "Đừng quên lịch hẹn khám lại vào 26/07 tại khoa Truyền nhiễm.",
    time: "10:45 18/07/2025",
    patient: "TTM",
  },
  {
    content: "Ưu đãi tháng 7 cho bệnh nhân Truyền nhiễm: Tư vấn miễn phí.",
    time: "13:00 15/07/2025",
    patient: "TTM",
  },

  {
    content:
      "Anh Lê Quốc Bảo có lịch khám chấn thương chỉnh hình ngày 27/07/2025 lúc 10:00.",
    time: "08:30 25/07/2025",
    patient: "LQB",
  },
  {
    content: "Chương trình phục hồi chức năng khớp – giảm 15% đến hết tháng 7.",
    time: "12:00 21/07/2025",
    patient: "LQB",
  },
  {
    content: "Anh vui lòng mang theo kết quả MRI trong lần khám tới.",
    time: "09:30 20/07/2025",
    patient: "LQB",
  },
  {
    content:
      "Nhắc nhở: Đeo nẹp cố định đúng cách để hỗ trợ phục hồi nhanh hơn.",
    time: "17:00 17/07/2025",
    patient: "LQB",
  },
  {
    content: "Bệnh viện xin cảm ơn anh Bảo đã tin tưởng sử dụng dịch vụ!",
    time: "10:10 15/07/2025",
    patient: "LQB",
  },

  {
    content:
      "Chị Phạm Thị Hương có lịch khám khoa Nội tổng quát ngày 28/07 lúc 09:00.",
    time: "11:15 26/07/2025",
    patient: "PTH",
  },
  {
    content: "Bệnh viện khuyến khích bệnh nhân kiểm tra định kỳ 6 tháng/lần.",
    time: "08:40 23/07/2025",
    patient: "PTH",
  },
  {
    content: "Chị vui lòng đến trước giờ hẹn 15 phút để làm thủ tục.",
    time: "10:30 21/07/2025",
    patient: "PTH",
  },
  {
    content: "Cảm ơn chị đã hoàn thành khảo sát chất lượng dịch vụ.",
    time: "16:50 18/07/2025",
    patient: "PTH",
  },
  {
    content: "Chương trình tặng phiếu khám miễn phí khi giới thiệu người thân.",
    time: "09:20 15/07/2025",
    patient: "PTH",
  },
  {
    content:
      "Anh Đỗ Minh Tâm có lịch tái khám Nội tiết lúc 08:30 ngày 29/07/2025.",
    time: "07:00 27/07/2025",
    patient: "DMT",
  },
  {
    content:
      "Lưu ý: Nhịn ăn trước khi làm xét nghiệm đường huyết sáng ngày 29/07.",
    time: "18:00 26/07/2025",
    patient: "DMT",
  },
  {
    content: "Bệnh viện triển khai gói tầm soát tiểu đường ưu đãi 20%.",
    time: "09:20 24/07/2025",
    patient: "DMT",
  },
  {
    content: "Mời anh Tâm tham gia buổi tư vấn sức khỏe miễn phí ngày 30/07.",
    time: "13:30 22/07/2025",
    patient: "DMT",
  },
  {
    content: "Xin cảm ơn anh đã đăng ký khám định kỳ tại khoa Nội tiết.",
    time: "11:00 19/07/2025",
    patient: "DMT",
  },

  {
    content:
      "Chị Hoàng Thị Lan có lịch khám Sản phụ khoa lúc 15:00 ngày 28/07/2025.",
    time: "10:10 26/07/2025",
    patient: "HTL",
  },
  {
    content: "Khuyến mãi kiểm tra sức khỏe phụ nữ - giảm 25% đến hết tháng.",
    time: "14:30 24/07/2025",
    patient: "HTL",
  },
  {
    content: "Vui lòng mang theo sổ khám thai trong lần tái khám tới.",
    time: "09:45 22/07/2025",
    patient: "HTL",
  },
  {
    content: "Chị Lan đã đăng ký thành công lịch khám với bác sĩ chuyên khoa.",
    time: "15:15 20/07/2025",
    patient: "HTL",
  },
  {
    content: "Chúc chị Lan và bé luôn mạnh khỏe và bình an.",
    time: "08:25 18/07/2025",
    patient: "HTL",
  },

  {
    content:
      "Anh Bùi Văn Cường có lịch khám Tim mạch lúc 09:30 ngày 30/07/2025.",
    time: "07:50 28/07/2025",
    patient: "BCV",
  },
  {
    content:
      "Lưu ý: Đo huyết áp tại nhà trước khi đến khám để có số liệu đối chiếu.",
    time: "12:10 26/07/2025",
    patient: "BCV",
  },
  {
    content: "Miễn phí siêu âm tim trong tuần lễ Tim mạch từ 25–31/07.",
    time: "10:40 23/07/2025",
    patient: "BCV",
  },
  {
    content: "Kết quả siêu âm tim của anh đã sẵn sàng, vui lòng đến quầy nhận.",
    time: "11:55 21/07/2025",
    patient: "BCV",
  },
  {
    content: "Xin cảm ơn anh đã tin tưởng sử dụng dịch vụ của chúng tôi!",
    time: "08:35 19/07/2025",
    patient: "BCV",
  },

  {
    content: "Chị Võ Thị Kim Ngân có lịch khám Da liễu ngày 27/07 lúc 16:00.",
    time: "09:20 25/07/2025",
    patient: "VTKN",
  },
  {
    content: "Gói chăm sóc da mùa hè: giảm 30% khi đăng ký trước 31/07.",
    time: "13:10 23/07/2025",
    patient: "VTKN",
  },
  {
    content: "Lưu ý: Không sử dụng mỹ phẩm trước ngày khám da.",
    time: "17:00 21/07/2025",
    patient: "VTKN",
  },
  {
    content: "Chị Ngân đã được chỉ định thực hiện xét nghiệm dị ứng.",
    time: "10:30 19/07/2025",
    patient: "VTKN",
  },
  {
    content: "Hãy giữ ẩm da đúng cách theo hướng dẫn từ bác sĩ chuyên khoa.",
    time: "15:00 17/07/2025",
    patient: "VTKN",
  },

  {
    content: "Anh Phan Anh Tú có lịch khám Tiêu hóa lúc 08:45 ngày 29/07/2025.",
    time: "07:00 27/07/2025",
    patient: "PAT",
  },
  {
    content: "Vui lòng không ăn uống trong vòng 6 tiếng trước giờ khám.",
    time: "20:00 26/07/2025",
    patient: "PAT",
  },
  {
    content: "Gói nội soi không đau – giảm giá đến 25% cho bệnh nhân cũ.",
    time: "12:30 24/07/2025",
    patient: "PAT",
  },
  {
    content: "Anh vui lòng đến trước giờ hẹn 30 phút để làm thủ tục.",
    time: "10:10 22/07/2025",
    patient: "PAT",
  },
  {
    content: "Chúng tôi đã nhận được thông tin phản hồi từ anh Tú. Cảm ơn anh!",
    time: "09:00 20/07/2025",
    patient: "PAT",
  },

  {
    content:
      "Chị Ngô Thị Yến có lịch khám Tai - Mũi - Họng ngày 28/07 lúc 14:00.",
    time: "11:30 26/07/2025",
    patient: "NTY",
  },
  {
    content: "Lưu ý: Không sử dụng thuốc nhỏ tai/nghẹt mũi trước 24h khám.",
    time: "15:15 24/07/2025",
    patient: "NTY",
  },
  {
    content: "Gói nội soi TMH ưu đãi 20% – Áp dụng đến hết 31/07.",
    time: "14:00 22/07/2025",
    patient: "NTY",
  },
  {
    content: "Chị Yến vui lòng xác nhận lịch khám ngày 28/07 qua ứng dụng.",
    time: "09:45 20/07/2025",
    patient: "NTY",
  },
  {
    content: "Cảm ơn chị đã đánh giá tích cực dịch vụ Tai - Mũi - Họng.",
    time: "08:20 18/07/2025",
    patient: "NTY",
  },
];
