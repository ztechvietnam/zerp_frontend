import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { SIDE_BAR } from "./components/constant/constant";
import ListUsers from "./pages/01.UsersManagement/ListUsers";
import ListPatients from "./pages/03.PatientsManagement/ListPatients";
import ListZaloMessages from "./pages/04.MessagesManagement/ListZaloMessages";
import ListRoles from "./pages/02.RolesManagement/ListRoles";
import DocumentsManagement from "./pages/06.DocumentsManagement/DocumentsManagement";
import DocumentCategories from "./pages/05.DocumentCategory/DocumentCategories";
import ListReviews from "./pages/07.ListReviews/ListReviews";
import ListDepartments from "./pages/08.DepartmentManagement/ListDepartments";
import PrivateRoute from "./context/PrivateRoute";
import HomeLayout from "./homepage/HomeLayout";
import { NewDetail } from "./homepage/NewDetail";
import HomeContent from "./homepage/HomeContent";
import NewsManagement from "./pages/09.NewsManagement/NewsManagement";
import { useEffect } from "react";
import DashboardHome from "./pages/DashboardHome/DashboardHome";

const TITLES: Record<string, string> = {
  ["/dashboard"]: "Trang chủ",
  ["/dashboard/users-management"]: "Quản lý người dùng",
  ["/dashboard/roles-management"]: "Quản lý phân quyền",
  ["/dashboard/patients-management"]: "Quản lý bệnh nhân",
  ["/dashboard/messages-management"]: "Lịch sử gửi tin nhắn ZNS",
  ["/dashboard/list-reviews"]: "Danh sách đánh giá",
  ["/dashboard/department-management"]: "Danh sách đơn vị",
  ["/dashboard/news"]: "Tin hoạt động",
  ["/dashboard/document-category"]: "Danh mục văn bản",
  ["/dashboard/document-management"]: "Quản lý văn bản",
};

function TitleManager() {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = "Bệnh viện đa khoa";
    document.title = TITLES[location.pathname] || defaultTitle;
  }, [location.pathname]);

  return null; // không render gì
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <TitleManager />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route
          element={
            <PrivateRoute>
              <HomeLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<HomeContent />} />
          <Route
            path={`${SIDE_BAR.NEW_DETAIL}/:idNew`}
            element={<NewDetail />}
          />
        </Route>
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/:environment/*"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />

          <Route path={SIDE_BAR.NEWS} element={<NewsManagement />} />

          <Route
            path={SIDE_BAR.DEPARTMENT_MANAGEMENT}
            element={<ListDepartments />}
          />
          <Route path={SIDE_BAR.USERS_MANAGEMENT} element={<ListUsers />} />
          <Route path={SIDE_BAR.ROLES_MANAGEMENT} element={<ListRoles />} />
          <Route
            path={SIDE_BAR.PATIENTS_MANAGEMENT}
            element={<ListPatients />}
          />
          <Route
            path={SIDE_BAR.MESSAGES_MANAGEMENT}
            element={<ListZaloMessages />}
          />
          <Route path={SIDE_BAR.LIST_REVIEWS} element={<ListReviews />} />
          <Route
            path={SIDE_BAR.DOCUMENT_CATEGORY}
            element={<DocumentCategories />}
          />
          <Route
            path={SIDE_BAR.DOCUMENT_MANAGEMENT}
            element={<DocumentsManagement />}
          />
          <Route
            path={`${SIDE_BAR.DOCUMENT}/:idCategory`}
            element={<DocumentsManagement />}
          />
        </Route>
      </Routes>
    </Router>
  );
}
