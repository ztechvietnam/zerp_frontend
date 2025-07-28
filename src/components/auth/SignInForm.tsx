import { useState } from "react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto md:min-w-[500px]">
        <div className="flex items-center justify-center gap-[5px] mb-[10px]">
          <img
            src="/images/logo/logo.jpg"
            alt="Logo"
            width={120}
            height={26}
          />
          <span className="text-[26px] font-bold text-[#006699]">ERP</span>
        </div>
        <div className="p-6 bg-white rounded-[5px] shadow-[0_0_30px_rgba(1,41,112,0.1)]">
          <div className="mb-5 sm:mb-8 flex flex-col items-center">
            <h2 className="mb-2 font-semibold text-[#006699] text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng nhập
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập tài khoản và mật khẩu
            </p>
          </div>
          <div>
            <form>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="" />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeOutlined className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeInvisibleOutlined className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button className="w-full mt-[15px]" size="sm">
                    Đăng nhập
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
