//src/router/index.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../store/auth.store";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

// Auth pages
import AuthLayout from "../components/layout/AuthLayout";
import LoginPage from "../pages/auth/LoginPage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";

// Admin pages
import AdminLayout from "../components/layout/AdminLayout";
import UserListPage from "../pages/admin/users/UserListPage";
import SubjectListPage from "../pages/admin/subjects/SubjectListPage";

// Teacher pages
import QuestionListPage from "../pages/teacher/questions/QuestionListPage";
import ExamListPage from "../pages/teacher/exams/ExamListPage";
import ExamFormPage from "../pages/teacher/exams/ExamFormPage";
import ExamDetailPage from "../pages/teacher/exams/ExamDetailPage";
import SessionListPage from "../pages/teacher/sessions/SessionListPage";
import SessionDetailPage from "../pages/teacher/sessions/SessionDetailPage";

// Student pages
import StudentLayout from "../components/layout/StudentLayout";
import ExamRoomPage from "../pages/student/ExamRoomPage";
import AttemptPage from "../pages/student/AttemptPage";
import ResultPage from "../pages/student/ResultPage";

const HomeRedirect = () => {
  const { role } = useAuthStore();

  if (role === "ADMIN") return <Navigate to="/admin/users" replace />;
  if (role === "TEACHER") return <Navigate to="/teacher/questions" replace />;
  if (role === "STUDENT") return <Navigate to="/student/room" replace />;

  return <Navigate to="/login" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <ChangePasswordPage />
            </PrivateRoute>
          }
        />

        {/* ADMIN + TEACHER */}
        <Route
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <UserListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <RoleRoute allowedRoles={["ADMIN"]}>
                <SubjectListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/questions"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <QuestionListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <ExamListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/create"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <ExamFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:id/edit"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <ExamFormPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/exams/:id"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <ExamDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/sessions"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <SessionListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/teacher/sessions/:id"
            element={
              <RoleRoute allowedRoles={["ADMIN", "TEACHER"]}>
                <SessionDetailPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* STUDENT */}
        <Route
          element={
            <PrivateRoute>
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/student/room"
            element={
              <RoleRoute allowedRoles={["STUDENT"]}>
                <ExamRoomPage />
              </RoleRoute>
            }
          />
          <Route
            path="/student/attempt/:id"
            element={
              <RoleRoute allowedRoles={["STUDENT"]}>
                <AttemptPage />
              </RoleRoute>
            }
          />
          <Route
            path="/student/result/:id"
            element={
              <RoleRoute allowedRoles={["STUDENT"]}>
                <ResultPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<div>404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
