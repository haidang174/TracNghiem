import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { changePassword } from "../../api/auth.api";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    setLoading(true);

    try {
      await changePassword({ currentPassword: oldPassword, newPassword: newPassword });
      setSuccess("Đổi mật khẩu thành công!");
      setTimeout(() => navigate("/"), 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Đổi mật khẩu thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">
        {/* Header */}
        <h1 className="text-2xl font-bold text-black mb-1 text-center">Đổi mật khẩu</h1>

        {/* Form */}
        <div className="flex flex-col gap-4 pt-6">
          <Input
            id="old-password"
            label="Mật khẩu cũ"
            type="password"
            placeholder="Nhập mật khẩu cũ"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
          />
          <Input
            id="new-password"
            label="Mật khẩu mới"
            type="password"
            placeholder="Ít nhất 6 ký tự"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
          <Input
            id="confirm-password"
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={confirmPassword && newPassword !== confirmPassword ? "Mật khẩu không khớp" : ""}
            required
          />

          {/* Error / Success */}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <div className="flex gap-2 mt-2">
            <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)} disabled={loading}>
              Quay lại
            </Button>
            <Button className="flex-1" loading={loading} onClick={handleSubmit}>
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
