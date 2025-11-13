import { useEffect, useMemo, useRef } from "react";
import UserDropdown from "../components/header/UserDropdown";
import { MenuOutlined } from "@ant-design/icons";
import { useSidebar } from "../context/SidebarContext";
import { environments, SUB_SYSTEM } from "../components/constant/constant";
import { useLocation, useNavigate } from "react-router-dom";
import {
  iconHiddenSidebar,
  iconShowSidebar,
} from "../components/IconSvg/iconSvg";

const AppHeader: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toggleMobileSidebar, setHiddenSidebar, hiddenSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

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

  const subSystem = useMemo(() => {
    const pathname = location.pathname.toLowerCase();

    if (pathname.includes("customer-support")) {
      return SUB_SYSTEM.CUSTOMER_SUPPORT;
    }
    if (pathname.includes("library")) {
      return SUB_SYSTEM.LIBRARY;
    }
    if (pathname.includes("management")) {
      return SUB_SYSTEM.MANAGEMENT;
    }

    return null;
  }, [location.pathname]);

  const handleSwitchEnvironment = (envKey: string, envPath: string) => {
    localStorage.setItem("selectedEnvironment", envKey);
    navigate(envPath);
  };

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
      {hiddenSidebar ? (
        <div className="hidden lg:flex lg:items-center lg:ml-1 cursor-pointer">
          <div onClick={() => setHiddenSidebar(!hiddenSidebar)}>
            {iconShowSidebar}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex lg:items-center lg:ml-1 cursor-pointer">
          <div onClick={() => setHiddenSidebar(!hiddenSidebar)}>
            {iconHiddenSidebar}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between grow flex-row lg:px-6">
        <div className="flex items-center justify-between w-auto gap-2 px-3 py-[7px] border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-[11px]">
          {environments.map((env) => (
            <div
              key={env.key}
              className={`flex text-[14px] font-medium cursor-pointer rounded-[5px] py-[5px] px-[10px] ${
                subSystem === env.key
                  ? "text-[#fff] border-[1px] bg-[#1677ff]"
                  : "text-gray-700 bg-gray-100 hover:bg-[#efefef]"
              }`}
              onClick={() => handleSwitchEnvironment(env.key, env.path)}
            >
              {env.title}
            </div>
          ))}
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
