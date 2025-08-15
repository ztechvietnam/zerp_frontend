import { useEffect, useRef } from "react";
import UserDropdown from "../components/header/UserDropdown";
import { MenuOutlined } from "@ant-design/icons";
import { useSidebar } from "../context/SidebarContext";
import { SUB_SYSTEM } from "../components/constant/constant";

const AppHeader: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleMobileSidebar, setSubSystem, subSystem } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-1000 dark:border-gray-800 dark:bg-gray-900 lg:border-b shadow-[0_2px_6px_0_rgba(1,41,112,0.1)]">
      <div className="flex lg:hidden">
        <MenuOutlined
          width={32}
          height={32}
          onClick={toggleMobileSidebar}
          className="p-2"
        />
      </div>
      <div className="flex items-center justify-between grow flex-row lg:px-6">
        <div className="flex items-center justify-between w-auto gap-2 px-3 py-[7px] border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-[11px]">
          <div
            className={`flex text-[14px] font-medium cursor-pointer rounded-[5px] py-[5px] px-[10px] ${
              subSystem === SUB_SYSTEM.CUSTOMER_SUPPORT
                ? "text-[#fff] border-[1px] bg-[#1677ff]"
                : "text-gray-700 bg-gray-100 hover:bg-[#efefef]"
            }`}
            onClick={() => {
              setSubSystem(SUB_SYSTEM.CUSTOMER_SUPPORT);
            }}
          >
            Chăm sóc khách hàng
          </div>
          <div
            className={`flex text-[14px] font-medium cursor-pointer rounded-[5px] py-[5px] px-[10px] ${
              subSystem === SUB_SYSTEM.LIBRARY
                ? "text-[#fff] border-[1px] bg-[#1677ff]"
                : "text-gray-700 bg-gray-100 hover:bg-[#efefef]"
            }`}
            onClick={() => {
              setSubSystem(SUB_SYSTEM.LIBRARY);
            }}
          >
            Thư viện điện tử
          </div>
          <div
            className={`flex text-[14px] font-medium cursor-pointer rounded-[5px] py-[5px] px-[10px] ${
              subSystem === SUB_SYSTEM.MANAGEMENT
                ? "text-[#fff] border-[1px] bg-[#1677ff]"
                : "text-gray-700 bg-gray-100 hover:bg-[#efefef]"
            }`}
            onClick={() => {
              setSubSystem(SUB_SYSTEM.MANAGEMENT);
            }}
          >
            Quản trị hệ thống
          </div>
        </div>
        <div
          className={`flex items-center w-auto gap-4py-4 justify-end px-0 shadow-none`}
        >
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
