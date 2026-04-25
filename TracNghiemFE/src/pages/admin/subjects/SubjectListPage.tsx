//src/pages/admin/subjects/SubjectListPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { getSubjects, createSubject, updateSubject, deleteSubject, type Subject, type CreateSubjectRequest } from "../../../api/subjects.api";

const EMPTY_FORM: CreateSubjectRequest = {
  name: ""
};

const SubjectListPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<CreateSubjectRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const limit = 10;

  // ===== FETCH =====
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await getSubjects({ page, limit, search });
      setSubjects(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setFormError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [page, search]);

  // ===== MODAL =====
  const openCreate = () => {
    setEditSubject(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (subject: Subject) => {
    setEditSubject(subject);
    setForm({ name: subject.name });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditSubject(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ===== SAVE =====
  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên môn học.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (editSubject) {
        await updateSubject(editSubject.id, form);
      } else {
        await createSubject(form);
      }
      closeModal();
      fetchSubjects();
    } catch (err: any) {
      setFormError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Xóa môn học "${subject.name}"?`)) return;
    try {
      await deleteSubject(subject.id);
      fetchSubjects();
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
          <h1 className="text-xl font-bold text-black">Môn học</h1>
          <p className="text-sm text-neutral-500">Quản lý danh sách môn học</p>
        </div>
        <Button onClick={openCreate}>+ Thêm môn học</Button>
      </div>

      {/* Search */}
      <Input
        id="search"
        placeholder="Tìm theo tên môn học..."
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
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Tên môn học</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-neutral-400">
                  Đang tải...
                </td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-neutral-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              subjects.map(subject => (
                <tr key={subject.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-black">{subject.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(subject)}>
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(subject)}>
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
          <span>Tổng {total} môn học</span>
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
            <h2 className="text-lg font-bold text-black">{editSubject ? "Sửa môn học" : "Thêm môn học"}</h2>

            <Input id="name" label="Tên môn học" placeholder="Nhập tên môn học" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex gap-2 mt-2">
              <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={saving}>
                Hủy
              </Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>
                {editSubject ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectListPage;
