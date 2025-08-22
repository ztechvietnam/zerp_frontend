/* eslint-disable @typescript-eslint/no-explicit-any */
import { Col, Form, Row, Input, Button, Spin } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { authService } from "../../common/services/auth/authService";
import { useState } from "react";

export default function SignInForm() {
  const [showMessage, setShowMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = useForm();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (formValues: any) => {
    try {
      setLoading(true);
      setShowMessage("");
      const resultLogin = await authService.emailLogin(
        formValues.username,
        formValues.password
      );
      setShowMessage("SUCCESS");
      setTimeout(() => {
        login(resultLogin);
        navigate("/");
        setLoading(false);
      }, 2000);
    } catch (e) {
      setLoading(false);
      setShowMessage("ERROR");
      console.log(e);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto md:min-w-[500px]">
        <div className="flex items-center justify-center gap-[5px] mb-[10px]">
          <img src="/images/logo/logo.jpg" alt="Logo" width={120} height={26} />
          <span className="text-[26px] font-bold text-[#006699]">ERP</span>
        </div>
        <div className="p-6 bg-white rounded-[5px] shadow-[0_0_30px_rgba(1,41,112,0.1)]">
          <div className="flex flex-col items-center">
            <h2 className="mb-2 font-semibold text-[#006699] text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập tài khoản và mật khẩu
            </p>
          </div>
          {showMessage === "ERROR" ? (
            <div className="flex p-4 m-4 mb-0 bg-[#f8d7da] border border-[#f1aeb5] rounded-lg text-[#58151c] text-sm">
              Tài khoản hoặc mật khẩu không đúng, vui lòng thử lại
            </div>
          ) : showMessage === "SUCCESS" ? (
            <div className="flex p-4 m-4 mb-0 bg-[#d1e7dd] border border-[#a3cfbb] rounded-lg text-[#0f5132] text-sm">
              Đăng nhập thành công
            </div>
          ) : (
            ""
          )}
          <Spin spinning={loading}>
            <Form layout="horizontal" form={form} style={{ padding: 24 }}>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Tài khoản"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tài khoản!",
                      },
                    ]}
                  >
                    <Input className="h-[40px]" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Mật khẩu"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu!",
                      },
                    ]}
                  >
                    <Input.Password className="h-[40px]" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Button
                    type="primary"
                    className="w-full mt-[12px]"
                    style={{ height: 40 }}
                    onClick={async () => {
                      try {
                        const formValues = await form.validateFields();
                        handleLogin(formValues);
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                  >
                    Đăng nhập
                  </Button>
                </Col>
              </Row>
            </Form>
          </Spin>
        </div>
      </div>
    </div>
  );
}
