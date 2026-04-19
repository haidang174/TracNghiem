import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { Button } from "../common/Button";

const StudentLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-black">Trắc Nghiệm</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-black">{user?.fullName}</p>
            <p className="text-xs text-neutral-400">{user?.username}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Đăng xuất
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate("/change-password")}>
            Đổi mật khẩu
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
