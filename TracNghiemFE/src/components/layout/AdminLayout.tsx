import { NavLink, Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { Button } from "../common/Button";

const navItems = [
  // ADMIN only
  { path: "/admin/users", label: "Người dùng", roles: ["ADMIN"] },
  { path: "/admin/subjects", label: "Môn học", roles: ["ADMIN"] },
  // ADMIN + TEACHER
  { path: "/teacher/questions", label: "Ngân hàng câu hỏi", roles: ["ADMIN", "TEACHER"] },
  { path: "/teacher/exams", label: "Đề thi", roles: ["ADMIN", "TEACHER"] },
  { path: "/teacher/sessions", label: "Phòng thi", roles: ["ADMIN", "TEACHER"] }
];

const AdminLayout = () => {
  const { user, role, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const filteredNav = navItems.filter(item => (role ? item.roles.includes(role) : false));

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col h-screen">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <span className="font-bold text-lg text-black">Trắc Nghiệm</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 
                ${isActive ? "bg-black text-white" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-4 py-4 border-t border-neutral-200 flex flex-col gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate("/change-password")}>
            Đổi mật khẩu
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-60 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-end px-6">
          <p className="text-sm text-neutral-500">
            Xin chào, <span className="font-medium text-black">{user?.fullName}</span>
          </p>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
