import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useRef } from "react";
import "../index.css";

const LayoutContent: React.FC = () => {
  const { isMobileOpen, hiddenSidebar } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen xl:flex">
      <div ref={sidebarRef}>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out max-w-[100vw] ${
          hiddenSidebar
            ? "!lg:w-full !lg:ml-0"
            : "lg:w-[calc(100%-290px)] lg:ml-[290px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="layoutBody px-[15px] py-2  lg:px-[30px] lg:py-2.5 mx-auto h-[calc(100vh-46.8px)] lg:h-[calc(100vh-54.8px)] bg-[#f6f9ff]">
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
