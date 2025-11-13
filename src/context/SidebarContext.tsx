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
import { DocumentCategoryPermissionEntity } from "../common/services/document-category-permissions/document-category-permissions";
import { useAuth } from "./AuthContext";
import { DocumentPermissionEntity } from "../common/services/document-permissions/document-permissions";
import { documentPermissionService } from "../common/services/document-permissions/documentPermissionsService";
import { documentCategoryPermissionService } from "../common/services/document-category-permissions/documentCategoryPermissionsService";

type SidebarContextType = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  hiddenSidebar: boolean;
  listDocumentCategories: DocumentCategoriesEntity[];
  departmentTree: DepartmentTreeNode[];
  perDocumentCategories: string[];
  perDocument: string[];
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setHiddenSidebar: (value: boolean) => void;
  getPerDocument: () => Promise<void>;
  getPerDocumentCate: () => Promise<void>;
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
  const [hiddenSidebar, setHiddenSidebar] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [listDocumentCategories, setListDocumentCategories] = useState<
    DocumentCategoriesEntity[]
  >([]);
  const [departmentTree, setDepartmentTree] = useState<DepartmentTreeNode[]>(
    []
  );
  const [perDocumentCategories, setPerDocumentCategories] = useState<string[]>(
    []
  );
  const [perDocument, setPerDocument] = useState<string[]>([]);
  const { currentUser } = useAuth();

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

  const getPerDocument = useCallback(async () => {
    if (currentUser && currentUser?.id) {
      try {
        const perDocument = await documentPermissionService.getPerByUserId(
          currentUser?.id
        );
        const listDocumentCanView =
          perDocument?.data && perDocument?.data?.length
            ? perDocument?.data.map((per: DocumentPermissionEntity) => {
                return per?.document_id;
              })
            : [];
        setPerDocument(listDocumentCanView);
      } catch (e) {
        console.log(e);
        setPerDocument([]);
      }
    }
  }, [currentUser]);

  const getPerDocumentCate = useCallback(async () => {
    if (currentUser && currentUser?.id) {
      try {
        const perCate = await documentCategoryPermissionService.getPerByUserId(
          currentUser?.id
        );
        const listCateCanView =
          perCate?.data && perCate?.data?.length
            ? perCate?.data.map((per: DocumentCategoryPermissionEntity) => {
                return per?.document_category_id;
              })
            : [];
        setPerDocumentCategories(listCateCanView);
      } catch (e) {
        console.log(e);
        setPerDocumentCategories([]);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser?.id) {
      (async () => {
        await getPerDocument();
        await getPerDocumentCate();
      })();
    }
  }, [currentUser, getPerDocument, getPerDocumentCate]);

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
        hiddenSidebar,
        perDocument,
        perDocumentCategories,
        toggleSidebar,
        toggleMobileSidebar,
        getPerDocument,
        getPerDocumentCate,
        setIsHovered,
        setActiveItem,
        setHiddenSidebar,
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
