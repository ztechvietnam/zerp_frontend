import { useEffect, useRef } from "react";
import UserDropdown from "../components/header/UserDropdown";
import { MenuOutlined } from "@ant-design/icons";
import { useSidebar } from "../context/SidebarContext";

const AppHeader: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {toggleMobileSidebar, isMobile, isExpanded, isMobileOpen, isHovered} = useSidebar();

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
        <MenuOutlined width={32} height={32} onClick={toggleMobileSidebar} className="p-2" />
      </div>
      <div className="flex items-center justify-between grow flex-row lg:px-6">
        <div className="flex items-center justify-between w-auto gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          BỆNH VIỆN ĐA KHOA QUỐC TẾ
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
