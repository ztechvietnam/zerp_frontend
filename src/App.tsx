import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { SIDE_BAR } from "./components/constant/constant";
import ListUsers from "./pages/01.UsersManagement/ListUsers";
import ListPatients from "./pages/03.PatientsManagement/ListPatients";
import ListMessages from "./pages/04.MessagesManagement/ListMessages";
import ListRoles from "./pages/02.RolesManagement/ListRoles";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            {/* <Route path="/profile" element={<UserProfiles />} /> */}
            <Route path={SIDE_BAR.USERS_MANAGEMENT} element={<ListUsers />} />
            <Route path={SIDE_BAR.ROLES_MANAGEMENT} element={<ListRoles />} />
            <Route
              path={SIDE_BAR.PATIENTS_MANAGEMENT}
              element={<ListPatients />}
            />
            <Route
              path={SIDE_BAR.MESSAGES_MANAGEMENT}
              element={<ListMessages />}
            />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </>
  );
}
