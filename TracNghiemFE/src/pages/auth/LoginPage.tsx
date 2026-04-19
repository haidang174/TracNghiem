//src/pages/auth/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/auth.store";
import { login } from "../../api/auth.api";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await login({ username, password });
      setAuth(res.data.user, res.data.accessToken);

      const role = res.data.user.role;
      if (role === "ADMIN") navigate("/admin/users");
      else if (role === "TEACHER") navigate("/teacher/questions");
      else navigate("/student/room");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Đăng nhập thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
      {/* Header */}
      <h1 className="text-2xl font-bold text-black mb-1 text-center">Đăng nhập</h1>

      {/* Form */}
      <div className="flex flex-col gap-4 pt-6">
        <Input id="username" label="Tên đăng nhập" placeholder="Nhập tên đăng nhập" value={username} onChange={e => setUsername(e.target.value)} required />
        <Input id="password" label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />

        {/* Error */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={loading} className="w-full mt-2" onClick={handleLogin}>
          Đăng nhập
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
