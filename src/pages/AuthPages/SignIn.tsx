import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="ĐĂNG NHẬP | BỆNH VIỆN ĐA KHOA QUỐC TẾ HẢI PHÒNG"
        description="ĐĂNG NHẬP | BỆNH VIỆN ĐA KHOA QUỐC TẾ HẢI PHÒNG"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
