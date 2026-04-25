//src/pages/admin/users/UserListPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus, type User, type CreateUserRequest, type UpdateUserRequest } from "../../../api/users.api";

const roleLabel: Record<string, string> = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh"
};

const EMPTY_FORM: CreateUserRequest = {
  username: "",
  password: "",
  fullName: "",
  email: "",
  role: "STUDENT"
};

const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<CreateUserRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const limit = 10;

  // ===== FETCH =====
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit, search });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // ===== MODAL =====
  const openCreate = () => {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({
      username: user.username,
      password: "",
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ===== SAVE =====
  const handleSave = async () => {
    if (!form.fullName || !form.email || !form.role) {
      setFormError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (!editUser && (!form.username || !form.password)) {
      setFormError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (editUser) {
        const payload: UpdateUserRequest = {
          fullName: form.fullName,
          email: form.email
        };
        await updateUser(editUser.id, payload);
      } else {
        await createUser(form);
      }
      closeModal();
      fetchUsers();
    } catch (err: any) {
      setFormError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (user: User) => {
    if (!confirm(`Xóa người dùng "${user.fullName}"?`)) return;
    try {
      await deleteUser(user.id);
      fetchUsers();
    } catch {
      /* empty */
    }
  };

  // ===== TOGGLE STATUS =====
  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.isActive;
    try {
      await toggleUserStatus(user.id, newStatus);
      fetchUsers();
    } catch {
      /* empty */
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Người dùng</h1>
          <p className="text-sm text-neutral-500">Quản lý tài khoản trong hệ thống</p>
        </div>
        <Button onClick={openCreate}>+ Thêm người dùng</Button>
      </div>

      {/* Search */}
      <Input
        id="search"
        placeholder="Tìm theo tên, email, username..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Họ tên</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Tên đăng nhập</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Vai trò</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Trạng thái</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-neutral-400">
                  Đang tải...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-neutral-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-black">{user.fullName}</td>
                  <td className="px-4 py-3 text-neutral-600">{user.username}</td>
                  <td className="px-4 py-3 text-neutral-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-neutral-100 text-neutral-700">{roleLabel[user.role]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        user.isActive ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Vô hiệu"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(user)}>
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>Tổng {total} người dùng</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Trước
            </Button>
            <span className="flex items-center px-2">
              {page} / {totalPages}
            </span>
            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Modal thêm/sửa */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-black">{editUser ? "Sửa người dùng" : "Thêm người dùng"}</h2>

            {!editUser && (
              <>
                <Input
                  id="username"
                  label="Tên đăng nhập"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  required
                />
                <Input
                  id="password"
                  label="Mật khẩu"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
              </>
            )}

            <Input
              id="full_name"
              label="Họ tên"
              placeholder="Nhập họ tên"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />

            {/* Role select */}
            {/* <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-sm font-medium text-neutral-700">
                Vai trò <span className="ml-1 text-black">*</span>
              </label>
              <select
                id="role"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value as CreateUserRequest["role"] })}
                className="h-10 px-3 text-sm border border-neutral-300 rounded-md bg-white text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="STUDENT">Học sinh</option>
                <option value="TEACHER">Giáo viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div> */}

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex gap-2 mt-2">
              <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={saving}>
                Hủy
              </Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>
                {editUser ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
