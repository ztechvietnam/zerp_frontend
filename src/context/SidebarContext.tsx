import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { documentCategoriesService } from "../common/services/document-categories/documentCategoriesService";
import { DocumentCategoriesEntity } from "../common/services/document-categories/documentCategories";
import { DepartmentTreeNode } from "../common/services/department/department";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  listDocumentCategories: DocumentCategoriesEntity[];
  departmentTree: DepartmentTreeNode[];
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  setListDocumentCategories: (item: DocumentCategoriesEntity[]) => void;
  setDepartmentTree: (item: DepartmentTreeNode[]) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [listDocumentCategories, setListDocumentCategories] = useState<
    DocumentCategoriesEntity[]
  >([]);
  const [departmentTree, setDepartmentTree] = useState<DepartmentTreeNode[]>(
    []
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(mobile);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getDocumentCategories = useCallback(async () => {
    try {
      const results = await documentCategoriesService.get({
        params: {
          limit: 100,
        },
      });
      const categories = results?.data || [];
      setListDocumentCategories(categories);
    } catch (e) {
      console.log(e);
      setListDocumentCategories([]);
    }
  }, []);

  useEffect(() => {
    getDocumentCategories();
  }, [getDocumentCategories]);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSubmenu = (item: string) => {
    setOpenSubmenu((prev) => (prev === item ? null : item));
  };

  return (
    <SidebarContext.Provider
      value={{
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isMobile,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        listDocumentCategories,
        setListDocumentCategories,
        departmentTree,
        setDepartmentTree,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
