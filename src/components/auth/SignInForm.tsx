import { Col, Form, Row, Input, Button } from "antd";
import { useForm } from "antd/lib/form/Form";

export default function SignInForm() {
  const [form] = useForm();

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
          <div>
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
                  <Button type="primary" htmlType="submit" className="w-full mt-[12px]" style={{ height: 40 }}>
                    Đăng nhập
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
