import { Drawer, Layout, Menu } from "antd";
import { Header } from "antd/es/layout/layout";
import { Link, Outlet } from "react-router-dom";
import { useState } from "react";
import { CloseOutlined, MenuOutlined } from "@ant-design/icons";

export default function HomeLayout() {
  const [open, setOpen] = useState(false);

  const items = [
    { key: "home", label: <Link to="/">Trang chủ</Link> },
    {
      key: "dashboard",
      label: (
        <Link
          to="/dashboard"
          rel="noopener noreferrer"
          className="hover:text-red-600"
        >
          Trang quản trị
        </Link>
      ),
    },
  ];
  return (
    <Layout className="min-h-screen">
      <Header className="!bg-white border-b border-gray-200 !h-[50px] !px-[15px] md:!px-[50px] md:!h-[64px]">
        <div className="w-full h-full max-h-[64px] py-2 flex justify-between items-center md:max-w-[1200px] md:mx-auto">
          <Link to="/" className="h-full">
            <img
              className="h-full w-auto"
              src="/images/logo/logo.jpg"
              alt="Logo"
              width={200}
              height={40}
            />
          </Link>

          <div className="hidden md:block">
            <Menu
              mode="horizontal"
              defaultSelectedKeys={["home"]}
              items={items}
              className="border-0"
            />
          </div>

          <div className="md:hidden">
            <button onClick={() => setOpen(!open)}>
              {open ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
        <Drawer
          placement="right"
          open={open}
          onClose={() => setOpen(false)}
          width={240}
          className="md:hidden"
        >
          <Menu
            mode="vertical"
            defaultSelectedKeys={["home"]}
            items={items}
            className="border-0"
          />
        </Drawer>
      </Header>

      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-white">
        <Outlet />

        {/* Footer là 1 phần của nội dung, chỉ hiện khi cuộn xuống */}
        <div className="text-center border-t border-gray-200 py-4 bg-[#d3d3d3]">
          Tin tức bệnh viện
        </div>
      </div>
    </Layout>
  );
}
