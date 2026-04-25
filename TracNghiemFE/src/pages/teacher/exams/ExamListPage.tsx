//src/pages/teacher/exams/ExamListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { getExams, deleteExam, type Exam } from "../../../api/exams.api";

const ExamListPage = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await getExams({ page, limit, search });
      setExams(res.data.data);
      setTotal(res.data.total);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [page, search]);

  const handleDelete = async (exam: Exam) => {
    if (!confirm(`Xóa đề thi "${exam.title}"?`)) return;
    try {
      await deleteExam(exam.id);
      fetchExams();
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
          <h1 className="text-xl font-bold text-black">Đề thi</h1>
          <p className="text-sm text-neutral-500">Quản lý đề thi trong hệ thống</p>
        </div>
        <Button onClick={() => navigate("/teacher/exams/create")}>+ Thêm đề thi</Button>
      </div>

      {/* Search */}
      <Input
        id="search"
        placeholder="Tìm theo tên đề thi..."
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
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Tên đề thi</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Môn học</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Số câu</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Thời gian</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Số mã đề</th>
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
            ) : exams.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-neutral-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              exams.map(exam => (
                <tr key={exam.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-black">{exam.title}</td>
                  <td className="px-4 py-3 text-neutral-600">{exam.subject_name}</td>
                  <td className="px-4 py-3 text-neutral-600">{exam.question_count} câu</td>
                  <td className="px-4 py-3 text-neutral-600">{exam.duration} phút</td>
                  <td className="px-4 py-3 text-neutral-600">{exam.variant_count} mã</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/exams/${exam.id}`)}>
                        Chi tiết
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}>
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(exam)}>
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
          <span>Tổng {total} đề thi</span>
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
    </div>
  );
};

export default ExamListPage;
