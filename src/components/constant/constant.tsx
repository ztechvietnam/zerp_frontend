/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CategoryEntity,
  TreeNode,
} from "../../common/services/category/category";
import { DocumentEntity } from "../../common/services/document/document";
import { MessageEntity } from "../../common/services/message/message";
import { PatientEntity } from "../../common/services/patient/patient";
import { QuestionEntity } from "../../common/services/question/question";
import { ReviewEntity } from "../../common/services/review/review";

export enum SIDE_BAR {
  LECTURE_VIDEO = "/lecture-video",
  NEWS = "/news",
  DEPARTMENT_LIST = "/department-list",
  USERS_MANAGEMENT = "/users-management",
  ROLES_MANAGEMENT = "/roles-management",
  PATIENTS_MANAGEMENT = "/patients-management",
  MESSAGES_MANAGEMENT = "/messages-management",
  LIST_REVIEWS = "/list-reviews",
  DOCUMENT_CATEGORY = "/document-category",
  DOCUMENT_MANAGEMENT = "/document-management",
  DOCUMENT = "/document",
}

export enum SUB_SYSTEM {
  CUSTOMER_SUPPORT = "CUSTOMER_SUPPORT",
  LIBRARY = "LIBRARYLIBRARY",
  MANAGEMENT = "MANAGEMENT",
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

export const dataTemplates = Array.from({ length: 25 }, (_, i) => ({
  label: `Biểu mẫu ${i + 1}`,
  value: `Biểu mẫu ${i + 1}`,
}));

export const documentCategories: CategoryEntity[] = [
  // Cấp cha
  {
    id: "1",
    name: "Phòng chức năng",
    code: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "2",
    name: "Khối cận lâm sàng",
    code: "KCLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "3",
    name: "Khối lâm sàng",
    code: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "4",
    name: "Tài liệu dùng chung",
    code: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  // Cấp con của PCN
  {
    id: "5",
    name: "Phòng KHTH",
    code: "PCN_ND",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "6",
    name: "Phòng TCHC",
    code: "PCN_TCHC",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "7",
    name: "Phòng TCKT",
    code: "PCN_TCKT",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "8",
    name: "Phòng CNTT",
    code: "PCN_CNTT",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "9",
    name: "Phòng Truyền thông",
    code: "PCN_TT",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "10",
    name: "Phòng CSKH",
    code: "PCN_CSKH",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "11",
    name: "Phòng CSSK cộng đồng",
    code: "PCN_CSKCD",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "12",
    name: "Phòng Điều dưỡng",
    code: "PCN_DD",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "13",
    name: "Phòng Đào tạo - QLCL",
    code: "PCN_DTQLCL",
    parentCode: "PCN",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  // Cấp con của KCLS
  {
    id: "15",
    name: "Khoa Xét nghiệm",
    code: "KCLS_XN",
    parentCode: "KCLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "16",
    name: "Khoa CĐHA và Thăm dò chức năng",
    code: "KCLS_CĐHA",
    parentCode: "KCLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "17",
    name: "Khoa KSNK",
    code: "KCLS_KSNK",
    parentCode: "KCLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "18",
    name: "Khoa Dược",
    code: "KCLS_DUOC",
    parentCode: "KCLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  // Cấp con của KLS
  {
    id: "19",
    name: "Khoa cấp cứu - HSTC",
    code: "KLS_CC_HSTC",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "20",
    name: "Khoa Khám bệnh",
    code: "KLS_KB",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "21",
    name: "Khoa Nội tổng hợp 1 (Hô Hấp - Nội tiết - Truyền Nhiễm)",
    code: "KLS_NOI1",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "22",
    name: "Khoa Thần Kinh đột quỵ",
    code: "KLS_TK_DOTQUY",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "23",
    name: "Khoa Tim mạch",
    code: "KLS_TIM",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "24",
    name: "Khoa Nội tổng hợp 2 (Dị ứng - Thận - Miễn dịch)",
    code: "KLS_NOI2",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "25",
    name: "Khoa Tiêu hóa - Nội soi (Tiêu hóa - Nội soi - Gan mật)",
    code: "KLS_TIEUHOA",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "26",
    name: "Khoa Tai mũi họng",
    code: "KLS_TMH",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "27",
    name: "Khoa Ngoại tổng hợp",
    code: "KLS_NGOAI_TONGHOP",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "28",
    name: "Khoa Ngoại Thận tiết niệu và Nam học",
    code: "KLS_NGOAI_THAN_NAMHOC",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "29",
    name: "Khoa Ngoại chấn thương chỉnh hình",
    code: "KLS_CTC",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "30",
    name: "Khoa Phục hồi chức năng",
    code: "KLS_PHCN",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "31",
    name: "Khoa Thận nhân tạo",
    code: "KLS_TNA",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "32",
    name: "Khoa Ung Bướu",
    code: "KLS_UNGBUOU",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "33",
    name: "Khoa Liên Chuyên Khoa RHM - Mắt",
    code: "KLS_LCK_RHM_MAT",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "34",
    name: "Khoa Gây mê hồi sức",
    code: "KLS_GMHS",
    parentCode: "KLS",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  // Cấp con của TLDC
  {
    id: "35",
    name: "Lịch khám bệnh",
    code: "TLDC_LICH_KHAM",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "36",
    name: "Lịch trực",
    code: "TLDC_LICH_TRUC",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "37",
    name: "KHTH - Bảo hiểm y tế",
    code: "TLDC_KHTH_BHYT",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "38",
    name: "Đào tạo - NCKH - QLCL",
    code: "TLDC_DT_NCKH_QLCL",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "39",
    name: "Tổ chức - Hành chính - Thiết bị y tế",
    code: "TLDC_TC_HC_TBYT",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "40",
    name: "Tài chính kế toán",
    code: "TLDC_TCKT",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
  {
    id: "41",
    name: "Kiểm soát nhiễm khuẩn",
    code: "TLDC_KSNK",
    parentCode: "TLDC",
    created: "2025-08-05T08:00:00Z",
    status: true,
  },
];

export const generateDataDocuments = (): DocumentEntity[] => {
  const pad = (num: any) => num.toString().padStart(3, "0");

  const getRandomCategory = (i: number) =>
    documentCategories.filter((cate) => {
      return cate.parentCode;
    })[i % documentCategories.length];

  const documents: DocumentEntity[] = [];

  for (let i = 1; i <= 100; i++) {
    const category = getRandomCategory(i);
    const document: DocumentEntity = {
      id: `doc-${i}`,
      name: `Văn bản ${i}`,
      code: `VB_${pad(i)}`,
      template: `Biểu mẫu ${i}`,
      category: category,
      createdBy: `Người tạo ${(i % 4) + 1}`,
      created: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
      status: Math.random() > 0.2,
    };
    documents.push(document);
  }

  return documents;
};

export const dataDocuments: DocumentEntity[] = generateDataDocuments();

export const buildCategoryTree = (categories: CategoryEntity[]): TreeNode[] => {
  const categoryMap = new Map<string, TreeNode>();
  categories.forEach((category) => {
    categoryMap.set(category.code, {
      item: category,
      key: category.code,
      children: [],
    });
  });

  const tree: TreeNode[] = [];
  categories.forEach((category) => {
    const node = categoryMap.get(category.code)!;

    if (category.parentCode) {
      const parentNode = categoryMap.get(category.parentCode);
      if (parentNode) {
        parentNode.children!.push(node);
      } else {
        console.warn(
          `⚠️ Không tìm thấy parent với code: '${category.parentCode}' cho node '${category.code}'`
        );
        tree.push(node);
      }
    } else {
      tree.push(node);
    }
  });
  const cleanEmptyChildren = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        cleanEmptyChildren(node.children);
      } else {
        delete node.children;
      }
    });
  };

  cleanEmptyChildren(tree);
  return tree;
};

export const listQuestions: QuestionEntity[] = [
  {
    id: "q1",
    order: 1,
    type: "CHOOSE",
    question:
      "Bệnh viện Quốc tế Sản Nhi Hải Phòng lắng nghe ý kiến của Quý khách và thay đổi để nâng cao chất lượng dịch vụ. Xin Quý khách vui lòng cho biết ý kiến của mình và điền đầy đủ, chính xác thông tin giúp chúng tôi có thể tiếp thu, phản hồi",
    options: [
      { label: "Đồng ý tham gia khảo sát", value: "yes", nextQuestionId: "q2" },
      { label: "Không đồng ý", value: "no", nextQuestionId: null },
    ],
    required: true,
  },
  {
    id: "q2",
    order: 2,
    type: "CHOOSE",
    question:
      "Quý khách có hài lòng khi khám chữa bệnh tại Bệnh viện Quốc tế Sản Nhi Hải Phòng không?",
    options: [
      { label: "Hài lòng", value: "yes", nextQuestionId: "q4" },
      { label: "Không hài lòng", value: "no", nextQuestionId: "q3" },
    ],
    required: true,
  },
  {
    id: "q3",
    order: 3,
    type: "TEXT",
    question:
      "Theo Quý khách, Bệnh viện Quốc tế Sản Nhi Hải Phòng cần cải thiện những dịch vụ gì để phục vụ tốt hơn nhu cầu khám chữa bệnh?",
    placeholder: "Vui lòng nhập tại đây",
    required: true,
    nextQuestionId: "q4",
  },
  {
    id: "q4",
    order: 4,
    type: "FORM",
    question: "Quý khách vui lòng nhập thông tin",
    required: true,
    formFields: [
      {
        name: "fullName",
        label: "Họ tên",
        type: "fullName",
        required: true,
        placeholder: "Nhập họ tên của bạn",
      },
      {
        name: "phone",
        label: "Số điện thoại",
        type: "phone",
        required: true,
        placeholder: "Nhập số điện thoại",
      },
      {
        name: "email",
        label: "Email",
        type: "email",
        required: false,
        placeholder: "Nhập email (nếu có)",
      },
    ],
  },
];

export const dataReviews: ReviewEntity[] = [
  {
    id: "1",
    name: "Nguyễn Thị A",
    phone: "0911000001",
    email: "a.nguyen@example.com",
    review: "Thái độ của nhân viên không thân thiện, trả lời cộc lốc.",
    created: "2025-08-01T10:20:00Z",
  },
  {
    id: "2",
    name: "Trần Văn B",
    phone: "0911000002",
    email: "b.tran@example.com",
    review: "Chờ khám quá lâu, không có thông báo rõ ràng.",
    created: "2025-08-01T11:15:00Z",
  },
  {
    id: "3",
    name: "Lê Thị C",
    phone: "0911000003",
    email: "c.le@example.com",
    review: "Quy trình khám rườm rà, mất nhiều thời gian.",
    created: "2025-08-01T11:45:00Z",
  },
  {
    id: "4",
    name: "Phạm Văn D",
    phone: "0911000004",
    email: "d.pham@example.com",
    review: "Bác sĩ khám rất sơ sài, không giải thích rõ tình trạng bệnh.",
    created: "2025-08-01T12:30:00Z",
  },
  {
    id: "5",
    name: "Hoàng Thị E",
    phone: "0911000005",
    email: "e.hoang@example.com",
    review: "Phòng khám đông đúc, không đảm bảo vệ sinh.",
    created: "2025-08-01T12:45:00Z",
  },
  {
    id: "6",
    name: "Đỗ Văn F",
    phone: "0911000006",
    email: "f.do@example.com",
    review: "Chi phí cao nhưng chất lượng phục vụ không tương xứng.",
    created: "2025-08-01T13:10:00Z",
  },
  {
    id: "7",
    name: "Ngô Thị G",
    phone: "0911000007",
    email: "g.ngo@example.com",
    review: "Lễ tân không hướng dẫn rõ ràng, gây khó khăn cho bệnh nhân mới.",
    created: "2025-08-01T13:25:00Z",
  },
  {
    id: "8",
    name: "Mai Văn H",
    phone: "0911000008",
    email: "h.mai@example.com",
    review: "Bác sĩ khám qua loa, cảm giác không quan tâm đến người bệnh.",
    created: "2025-08-01T13:45:00Z",
  },
  {
    id: "9",
    name: "Lương Thị I",
    phone: "0911000009",
    email: "i.luong@example.com",
    review: "Khám rồi vẫn không biết bệnh gì, không yên tâm chút nào.",
    created: "2025-08-01T14:00:00Z",
  },
  {
    id: "10",
    name: "Vũ Văn J",
    phone: "0911000010",
    email: "j.vu@example.com",
    review: "Máy móc trục trặc, phải đợi sửa rất lâu mới được tiếp tục khám.",
    created: "2025-08-01T14:20:00Z",
  },
  {
    id: "11",
    name: "Nguyễn Văn K",
    phone: "0911000011",
    email: "k.nguyen@example.com",
    review: "Không có chỗ ngồi chờ, bệnh nhân phải đứng rất lâu.",
    created: "2025-08-01T14:30:00Z",
  },
  {
    id: "12",
    name: "Trịnh Thị L",
    phone: "0911000012",
    email: "l.trinh@example.com",
    review: "Đăng ký online rồi mà vẫn phải chờ cả tiếng đồng hồ.",
    created: "2025-08-01T14:40:00Z",
  },
  {
    id: "13",
    name: "Lý Văn M",
    phone: "0911000013",
    email: "m.ly@example.com",
    review: "Giá thuốc tại quầy cao hơn nhiều so với bên ngoài.",
    created: "2025-08-01T15:00:00Z",
  },
  {
    id: "14",
    name: "Đoàn Thị N",
    phone: "0911000014",
    email: "n.doan@example.com",
    review: "Thái độ bác sĩ thiếu nhiệt tình, không trả lời câu hỏi rõ ràng.",
    created: "2025-08-01T15:15:00Z",
  },
  {
    id: "15",
    name: "Kiều Văn O",
    phone: "0911000015",
    email: "o.kieu@example.com",
    review: "Hẹn tái khám nhưng đến nơi vẫn phải chờ lại từ đầu.",
    created: "2025-08-01T15:30:00Z",
  },
  {
    id: "16",
    name: "Bùi Thị P",
    phone: "0911000016",
    email: "p.bui@example.com",
    review: "Nhân viên kỹ thuật làm việc chậm, thiếu trách nhiệm.",
    created: "2025-08-01T15:45:00Z",
  },
  {
    id: "17",
    name: "Tống Văn Q",
    phone: "0911000017",
    email: "q.tong@example.com",
    review: "Không có người hướng dẫn trong khu vực khám, rất lộn xộn.",
    created: "2025-08-01T16:00:00Z",
  },
  {
    id: "18",
    name: "Phan Thị R",
    phone: "0911000018",
    email: "r.phan@example.com",
    review: "Không khí phòng chờ quá nóng, không có điều hòa.",
    created: "2025-08-01T16:15:00Z",
  },
  {
    id: "19",
    name: "Nguyễn Văn S",
    phone: "0911000019",
    email: "s.nguyen@example.com",
    review: "Khâu thanh toán rườm rà, mất thời gian.",
    created: "2025-08-01T16:30:00Z",
  },
  {
    id: "20",
    name: "Võ Thị T",
    phone: "0911000020",
    email: "t.vo@example.com",
    review: "Y tá gọi nhầm tên, gây nhầm lẫn giữa bệnh nhân.",
    created: "2025-08-01T16:45:00Z",
  },
  {
    id: "21",
    name: "Hồ Văn U",
    phone: "0911000021",
    email: "u.ho@example.com",
    review: "Quy trình xét nghiệm chậm, chờ kết quả quá lâu.",
    created: "2025-08-01T17:00:00Z",
  },
  {
    id: "22",
    name: "Trương Thị V",
    phone: "0911000022",
    email: "v.truong@example.com",
    review: "Không có nơi để đồ cá nhân, rất bất tiện.",
    created: "2025-08-01T17:15:00Z",
  },
  {
    id: "23",
    name: "Đặng Văn W",
    phone: "0911000023",
    email: "w.dang@example.com",
    review:
      "Bác sĩ dùng từ chuyên môn quá nhiều, không giải thích cho người bệnh hiểu.",
    created: "2025-08-01T17:30:00Z",
  },
  {
    id: "24",
    name: "Cao Thị X",
    phone: "0911000024",
    email: "x.cao@example.com",
    review: "Dịch vụ chăm sóc sau khám gần như không có.",
    created: "2025-08-01T17:45:00Z",
  },
  {
    id: "25",
    name: "Nguyễn Văn Y",
    phone: "0911000025",
    email: "y.nguyen@example.com",
    review: "Không hài lòng với cách xử lý phản ánh của bệnh viện.",
    created: "2025-08-01T18:00:00Z",
  },
];
