import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useRef } from "react";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen xl:flex">
      <div ref={sidebarRef}>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered
            ? "lg:w-[calc(100%-290px)] lg:ml-[290px]"
            : "lg:w-[calc(100%-90px)] lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="px-[15px] py-[8px]  lg:px-[30px] lg:py-[10px] mx-auto h-[calc(100vh-46.8px)] lg:h-[calc(100vh-54.8px)] bg-[#f6f9ff]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
