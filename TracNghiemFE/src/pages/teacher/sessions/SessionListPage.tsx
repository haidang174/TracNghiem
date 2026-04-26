//src/pages/teacher/sessions/SessionListPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import {
  getSessions,
  createSession,
  updateSessionStatus,
  getSessionStudents,
  addStudentToSession,
  removeStudentFromSession,
  type Session,
  type SessionStudent,
  type CreateSessionRequest
} from "../../../api/sessions.api";
import { getExams, type Exam } from "../../../api/exams.api";
import { getUsers, type User } from "../../../api/users.api";

const STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  active: "Đang diễn ra",
  closed: "Đã kết thúc"
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  active: "bg-green-50 text-green-700",
  closed: "bg-red-50 text-red-500"
};

const NEXT_STATUS: Record<string, "active" | "closed"> = {
  draft: "active",
  active: "closed"
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  draft: "Mở phòng thi",
  active: "Kết thúc"
};

const EMPTY_FORM: CreateSessionRequest = {
  title: "",
  exam_id: 0,
  duration: 45,
  end_time: ""
};

const SessionListPage = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal tạo phòng thi
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [form, setForm] = useState<CreateSessionRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal quản lý học sinh
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<SessionStudent[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  const limit = 10;

  // ===== FETCH SESSIONS =====
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getSessions({ page, limit, search });
      setSessions(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, search]);

  // ===== CREATE MODAL =====
  const openCreateModal = async () => {
    setForm(EMPTY_FORM);
    setFormError("");
    const res = await getExams({ limit: 100 });
    setExams(res.data.data);
    setCreateModalOpen(true);
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      setFormError("Vui lòng nhập tên phòng thi.");
      return;
    }
    if (!form.exam_id) {
      setFormError("Vui lòng chọn đề thi.");
      return;
    }
    if (!form.duration || form.duration <= 0) {
      setFormError("Vui lòng nhập thời gian làm bài.");
      return;
    }
    if (!form.end_time) {
      setFormError("Vui lòng chọn thời gian kết thúc.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      await createSession(form);
      setCreateModalOpen(false);
      fetchSessions();
    } catch {
      /* empty */
    } finally {
      setSaving(false);
    }
  };

  // ===== UPDATE STATUS =====
  const handleUpdateStatus = async (session: Session) => {
    const next = NEXT_STATUS[session.status];
    if (!next) return;
    if (!confirm(`${NEXT_STATUS_LABEL[session.status]} phòng thi "${session.title}"?`)) return;
    try {
      await updateSessionStatus(session.id, next);
      fetchSessions();
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra.");
    }
  };

  // ===== STUDENT MODAL =====
  const openStudentModal = async (session: Session) => {
    setActiveSession(session);
    setStudentSearch("");
    setStudentModalOpen(true);
    setLoadingStudents(true);
    try {
      const [enrolled, all] = await Promise.all([getSessionStudents(session.id), getUsers({ limit: 1000 })]);
      setStudents(enrolled.data);
      setAllStudents(all.data.data.filter((u: { role: string }) => u.role === "STUDENT"));
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleAddStudent = async (userId: number) => {
    if (!activeSession) return;
    try {
      await addStudentToSession(activeSession.id, userId);
      const updated = await getSessionStudents(activeSession.id);
      setStudents(updated.data);
    } catch (err: any) {
      console.log("err:", err);
      setError(err?.message || "Có lỗi xảy ra.");
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!activeSession) return;
    if (!confirm("Xóa học sinh khỏi phòng thi?")) return;
    try {
      await removeStudentFromSession(activeSession.id, studentId);
      const updated = await getSessionStudents(activeSession.id);
      setStudents(updated.data);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra.");
    }
  };

  // Lọc học sinh chưa có trong phòng
  const enrolledIds = students.map(s => s.student_id);
  const filteredStudents = allStudents.filter(
    u => !enrolledIds.includes(u.id) && (u.fullName.toLowerCase().includes(studentSearch.toLowerCase()) || u.username.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">Phòng thi</h1>
          <p className="text-sm text-neutral-500">Quản lý các phòng thi</p>
        </div>
        <Button onClick={openCreateModal}>+ Tạo phòng thi</Button>
      </div>

      {/* Search */}
      <Input
        id="search"
        placeholder="Tìm theo tên phòng thi..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-sm"
      />

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 text-lg leading-none">
            X
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Tên phòng thi</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Đề thi</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Trạng thái</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Thời gian</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Ngày tạo</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-neutral-400">
                  Đang tải...
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-neutral-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              sessions.map(session => (
                <tr key={session.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-black">{session.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{session.exam_title}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLE[session.status]}`}>{STATUS_LABEL[session.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{session.duration} phút</td>
                  <td className="px-4 py-3 text-neutral-500">{new Date(session.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Xem chi tiết */}
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/sessions/${session.id}`)}>
                        Chi tiết
                      </Button>

                      {/* Quản lý học sinh — chỉ khi chưa closed */}
                      {session.status !== "closed" && (
                        <Button variant="secondary" size="sm" onClick={() => openStudentModal(session)}>
                          Học sinh
                        </Button>
                      )}

                      {/* Đổi trạng thái — chỉ khi chưa closed */}
                      {session.status !== "closed" && (
                        <Button variant={session.status === "active" ? "danger" : "primary"} size="sm" onClick={() => handleUpdateStatus(session)}>
                          {NEXT_STATUS_LABEL[session.status]}
                        </Button>
                      )}
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
          <span>Tổng {total} phòng thi</span>
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

      {/* ===== MODAL TẠO PHÒNG THI ===== */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-black">Tạo phòng thi</h2>

            <Input
              id="session-title"
              label="Tên phòng thi"
              placeholder="Nhập tên phòng thi"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="exam" className="text-sm font-medium text-neutral-700">
                Đề thi <span className="text-black">*</span>
              </label>
              <select
                id="exam"
                value={form.exam_id}
                onChange={e => setForm({ ...form, exam_id: Number(e.target.value) })}
                className="h-10 px-3 text-sm border border-neutral-300 rounded-md bg-white text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value={0}>-- Chọn đề thi --</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
              <Input
                id="duration"
                label="Thời gian làm bài (phút)"
                type="number"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                required
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="end_time" className="text-sm font-medium text-neutral-700">
                  Thời gian kết thúc <span className="text-black">*</span>
                </label>
                <input
                  id="end_time"
                  type="datetime-local"
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  className="h-10 px-3 text-sm border border-neutral-300 rounded-md bg-white text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex gap-2 mt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setCreateModalOpen(false)} disabled={saving}>
                Hủy
              </Button>
              <Button className="flex-1" loading={saving} onClick={handleCreate}>
                Tạo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL QUẢN LÝ HỌC SINH ===== */}
      {studentModalOpen && activeSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-black">Quản lý học sinh</h2>
                <p className="text-sm text-neutral-400">{activeSession.title}</p>
              </div>
              <button onClick={() => setStudentModalOpen(false)} className="text-neutral-400 hover:text-black text-xl leading-none">
                X
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Cột trái: Học sinh trong phòng */}
              <div className="flex-1 border-r border-neutral-200 flex flex-col">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Trong phòng ({students.length})</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {loadingStudents ? (
                    <p className="text-center py-6 text-sm text-neutral-400">Đang tải...</p>
                  ) : students.length === 0 ? (
                    <p className="text-center py-6 text-sm text-neutral-400">Chưa có học sinh</p>
                  ) : (
                    students.map(s => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-50">
                        <div>
                          <p className="text-sm font-medium text-black">{s.student_name}</p>
                          <p className="text-xs text-neutral-400">{s.email}</p>
                        </div>
                        <button onClick={() => handleRemoveStudent(s.student_id)} className="text-xs text-red-500 hover:underline">
                          Xóa
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Cột phải: Thêm học sinh */}
              <div className="flex-1 flex flex-col">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Thêm học sinh</p>
                  <input
                    type="text"
                    placeholder="Tìm học sinh..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full h-8 px-3 text-sm border border-neutral-300 rounded-md outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="text-center py-6 text-sm text-neutral-400">Không có học sinh</p>
                  ) : (
                    filteredStudents.map(u => (
                      <div key={u.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-50">
                        <div>
                          <p className="text-sm font-medium text-black">{u.fullName}</p>
                          <p className="text-xs text-neutral-400">{u.username}</p>
                        </div>
                        <button onClick={() => handleAddStudent(u.id)} className="text-xs text-black hover:underline font-medium">
                          + Thêm
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionListPage;
