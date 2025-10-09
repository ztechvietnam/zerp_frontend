/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useSidebar } from "../context/SidebarContext";
import {
  buildCategoryTree,
  documentCategories,
  SIDE_BAR,
  SUB_SYSTEM,
} from "../components/constant/constant";
import {
  BarsOutlined,
  BookOutlined,
  CommentOutlined,
  DownOutlined,
  EllipsisOutlined,
  FileDoneOutlined,
  HddOutlined,
  NotificationOutlined,
  PlaySquareOutlined,
  SolutionOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  subSystem?: string;
};

const customerCareNavItems: NavItem[] = [
  {
    name: "Chăm sóc khách hàng",
  },
  {
    icon: <SolutionOutlined />,
    name: "Quản lý bệnh nhân",
    path: SIDE_BAR.PATIENTS_MANAGEMENT,
    subSystem: SUB_SYSTEM.CUSTOMER_SUPPORT,
  },
  {
    icon: <CommentOutlined />,
    name: "Lịch sử gửi tin nhắn ZNS",
    path: SIDE_BAR.MESSAGES_MANAGEMENT,
    subSystem: SUB_SYSTEM.CUSTOMER_SUPPORT,
  },
  {
    icon: <FileDoneOutlined />,
    name: "Danh sách đánh giá",
    path: SIDE_BAR.LIST_REVIEWS,
    subSystem: SUB_SYSTEM.CUSTOMER_SUPPORT,
  },
];

const newsNavItems: NavItem[] = [
  {
    name: "Tin tức bệnh viện",
  },
  {
    icon: <NotificationOutlined />,
    name: "Tin hoạt động",
    path: SIDE_BAR.NEWS,
  },
];

const documentManagementNavItems: NavItem[] = [
  {
    name: "Phân hệ quản trị văn bản",
  },
  {
    icon: <BookOutlined />,
    name: "Danh mục văn bản",
    path: SIDE_BAR.DOCUMENT_CATEGORY,
    subSystem: SUB_SYSTEM.MANAGEMENT,
  },
  {
    icon: <BookOutlined />,
    name: "Quản lý văn bản",
    path: SIDE_BAR.DOCUMENT_MANAGEMENT,
    subSystem: SUB_SYSTEM.MANAGEMENT,
  },
];

const systemAdminNavItems: NavItem[] = [
  {
    name: "Phân hệ quản trị hệ thống",
  },
  {
    icon: <BarsOutlined />,
    name: "Danh sách đơn vị",
    path: SIDE_BAR.DEPARTMENT_MANAGEMENT,
    subSystem: SUB_SYSTEM.MANAGEMENT,
  },
  {
    icon: <UserOutlined />,
    name: "Quản lý người dùng",
    path: SIDE_BAR.USERS_MANAGEMENT,
    subSystem: SUB_SYSTEM.MANAGEMENT,
  },
  {
    icon: <UnlockOutlined />,
    name: "Quản lý phân quyền",
    path: SIDE_BAR.ROLES_MANAGEMENT,
    subSystem: SUB_SYSTEM.MANAGEMENT,
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname.includes(path),
    [location.pathname]
  );

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

  const documentLookupNavItems: NavItem[] = useMemo(() => {
    const treeData = buildCategoryTree(documentCategories);

    const categoryNavItems: NavItem[] = treeData.map((data) => {
      if (data.children && data.children.length) {
        return {
          icon: <HddOutlined />,
          name: data.item.name,
          subItems: data.children.map((child) => ({
            name: child.item.name,
            path: `${SIDE_BAR.DOCUMENT}/${child.item.id}`,
            pro: false,
          })),
          subSystem: SUB_SYSTEM.LIBRARY,
        };
      } else {
        return {
          icon: <HddOutlined />,
          name: data.item.name,
          path: `${SIDE_BAR.DOCUMENT}/${data.item.id}`,
          subSystem: SUB_SYSTEM.LIBRARY,
        };
      }
    });

    return [
      {
        name: "Tra cứu văn bản",
      },
      ...categoryNavItems,
      {
        icon: <PlaySquareOutlined />,
        name: "Clip bài giảng",
        path: SIDE_BAR.LECTURE_VIDEO,
        subSystem: SUB_SYSTEM.LIBRARY,
      },
    ];
  }, [documentCategories]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => {
    const itemTitle = items.filter((item) => !item.icon);
    const itemRender = items.filter((item) => item.icon);
    return (
      <div>
        <h2
          className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
            !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            `${itemTitle.length ? itemTitle[0].name.toUpperCase() : "Khác"}`
          ) : (
            <EllipsisOutlined />
          )}
        </h2>
        <ul className="flex flex-col gap-4">
          {itemRender.map((nav, index) => (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size  ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <DownOutlined
                      className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                        openSubmenu?.type === menuType &&
                        openSubmenu?.index === index
                          ? "rotate-180 text-brand-500"
                          : ""
                      }`}
                    />
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    className={`menu-item group ${
                      isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        isActive(nav.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span
                        className={`menu-item-text ${
                          isActive(nav.path)
                            ? "text-[#1677ff]"
                            : "text-[#344054]"
                        }`}
                      >
                        {nav.name}
                      </span>
                    )}
                  </Link>
                )
              )}
              {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height:
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? `${subMenuHeight[`${menuType}-${index}`]}px`
                        : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          }`}
                        >
                          {subItem.name}
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 pl-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 shadow-[2px_0_6px_0_rgba(1,41,112,0.1)] 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px] mt-[46.8px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px] mt-[46.8px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-4 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link
          to="/dashboard"
          onClick={() => {
            localStorage.removeItem("selectedEnvironment");
          }}
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.jpg"
                alt="Logo"
                width={200}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div
        className={`flex flex-col overflow-y-auto duration-300 ease-linear ${
          isExpanded || isMobileOpen
            ? "max-h-[calc(100vh-74.64px-46.8px)]"
            : isHovered
            ? "max-h-[calc(100vh-74.64px)]"
            : "max-h-[calc(100vh-74.64px-46.8px)]"
        } lg:max-h-[calc(100vh-74.64px)]`}
      >
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {subSystem === SUB_SYSTEM.CUSTOMER_SUPPORT && (
              <div>{renderMenuItems(customerCareNavItems, "main")}</div>
            )}
            <div>{renderMenuItems(newsNavItems, "main")}</div>
            {subSystem === SUB_SYSTEM.LIBRARY && (
              <div>{renderMenuItems(documentLookupNavItems, "main")}</div>
            )}
            {subSystem === SUB_SYSTEM.MANAGEMENT && (
              <div>{renderMenuItems(documentManagementNavItems, "main")}</div>
            )}
            {subSystem === SUB_SYSTEM.MANAGEMENT && (
              <div>{renderMenuItems(systemAdminNavItems, "main")}</div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
