//src/pages/teacher/questions/QuestionListPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, type Question, type Answer, type CreateQuestionRequest } from "../../../api/questions.api";
import { getSubjects, type Subject } from "../../../api/subjects.api";

const EMPTY_ANSWERS: Answer[] = [
  { content: "", is_correct: true },
  { content: "", is_correct: false },
  { content: "", is_correct: false },
  { content: "", is_correct: false }
];

const EMPTY_FORM: CreateQuestionRequest = {
  content: "",
  subject_id: 0,
  answers: EMPTY_ANSWERS
};

const QuestionListPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<Question | null>(null);
  const [form, setForm] = useState<CreateQuestionRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const limit = 10;

  // ===== FETCH =====
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await getQuestions({
        page,
        limit,
        search,
        subject_id: filterSubject || undefined
      });
      setQuestions(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setFormError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubjects({ limit: 100 }).then(res => setSubjects(res.data.data));
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [page, search, filterSubject]);

  // ===== MODAL =====
  const openCreate = () => {
    setEditQuestion(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (question: Question) => {
    setEditQuestion(question);
    setForm({
      content: question.content,
      subject_id: question.subject_id,
      answers: question.answers.map(a => ({
        id: a.id,
        content: a.content,
        is_correct: a.is_correct
      }))
    });
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditQuestion(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ===== ANSWER HELPERS =====
  const updateAnswer = (index: number, content: string) => {
    const updated = form.answers.map((a, i) => ({ ...a, content: i === index ? content : a.content }));
    setForm({ ...form, answers: updated });
  };

  const setCorrectAnswer = (index: number) => {
    const updated = form.answers.map((a, i) => ({ ...a, is_correct: i === index }));
    setForm({ ...form, answers: updated });
  };

  const addAnswer = () => {
    if (form.answers.length >= 6) return;
    setForm({ ...form, answers: [...form.answers, { content: "", is_correct: false }] });
  };

  const removeAnswer = (index: number) => {
    if (form.answers.length <= 2) return;
    const updated = form.answers.filter((_, i) => i !== index);
    // Nếu xóa đáp án đúng thì set đáp án đầu tiên là đúng
    const hasCorrect = updated.some(a => a.is_correct);
    if (!hasCorrect) updated[0].is_correct = true;
    setForm({ ...form, answers: updated });
  };

  // ===== VALIDATE =====
  const validate = (): string => {
    if (!form.content.trim()) return "Vui lòng nhập nội dung câu hỏi.";
    if (!form.subject_id) return "Vui lòng chọn môn học.";
    if (form.answers.some(a => !a.content.trim())) return "Vui lòng nhập đầy đủ nội dung các đáp án.";
    if (!form.answers.some(a => a.is_correct)) return "Vui lòng chọn 1 đáp án đúng.";
    return "";
  };

  // ===== SAVE =====
  const handleSave = async () => {
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (editQuestion) {
        await updateQuestion(editQuestion.id, form);
      } else {
        await createQuestion(form);
      }
      closeModal();
      fetchQuestions();
    } catch (err: any) {
      setFormError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ===== DELETE =====
  const handleDelete = async (question: Question) => {
    if (!confirm("Xóa câu hỏi này?")) return;
    try {
      await deleteQuestion(question.id);
      fetchQuestions();
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
          <h1 className="text-xl font-bold text-black">Ngân hàng câu hỏi</h1>
          <p className="text-sm text-neutral-500">Quản lý danh sách câu hỏi</p>
        </div>
        <Button onClick={openCreate}>+ Thêm câu hỏi</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Input
          id="search"
          placeholder="Tìm theo nội dung câu hỏi..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <select
          value={filterSubject}
          onChange={e => {
            setFilterSubject(Number(e.target.value));
            setPage(1);
          }}
          className="h-10 px-3 text-sm border border-neutral-300 rounded-md bg-white text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
        >
          <option value={0}>Tất cả môn học</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600 w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Nội dung câu hỏi</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Môn học</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Số đáp án</th>
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
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-neutral-400">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              questions.map((question, index) => (
                <tr key={question.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                  <td className="px-4 py-3 text-neutral-400">{(page - 1) * limit + index + 1}</td>
                  <td className="px-4 py-3 text-black max-w-md">
                    <p className="line-clamp-2">{question.content}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-neutral-100 text-neutral-700">{question.subject_name}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{question.answers.length} đáp án</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(question)}>
                        Sửa
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(question)}>
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
          <span>Tổng {total} câu hỏi</span>
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-black">{editQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi"}</h2>

            {/* Nội dung câu hỏi */}
            <div className="flex flex-col gap-1">
              <label htmlFor="content" className="text-sm font-medium text-neutral-700">
                Nội dung câu hỏi <span className="text-black">*</span>
              </label>
              <textarea
                id="content"
                rows={3}
                placeholder="Nhập nội dung câu hỏi..."
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white text-black placeholder-neutral-400 outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
              />
            </div>

            {/* Môn học */}
            <div className="flex flex-col gap-1">
              <label htmlFor="subject" className="text-sm font-medium text-neutral-700">
                Môn học <span className="text-black">*</span>
              </label>
              <select
                id="subject"
                value={form.subject_id}
                onChange={e => setForm({ ...form, subject_id: Number(e.target.value) })}
                className="h-10 px-3 text-sm border border-neutral-300 rounded-md bg-white text-black outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value={0}>-- Chọn môn học --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Đáp án */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-700">
                  Đáp án <span className="text-black">*</span>
                  <span className="ml-1 text-xs text-neutral-400">(chọn đáp án đúng)</span>
                </label>
                {form.answers.length < 6 && (
                  <button onClick={addAnswer} className="text-xs text-black underline hover:no-underline">
                    + Thêm đáp án
                  </button>
                )}
              </div>

              {form.answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Radio chọn đáp án đúng */}
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={answer.is_correct}
                    onChange={() => setCorrectAnswer(index)}
                    className="w-4 h-4 accent-black flex-shrink-0"
                  />
                  <input
                    type="text"
                    placeholder={`Đáp án ${index + 1}`}
                    value={answer.content}
                    onChange={e => updateAnswer(index, e.target.value)}
                    className={`flex-1 h-9 px-3 text-sm border rounded-md bg-white text-black placeholder-neutral-400 outline-none focus:border-black focus:ring-1 focus:ring-black
                      ${answer.is_correct ? "border-black" : "border-neutral-300"}`}
                  />
                  {form.answers.length > 2 && (
                    <button onClick={() => removeAnswer(index)} className="text-neutral-400 hover:text-red-500 flex-shrink-0 text-lg leading-none">
                      ×
                    </button>
                  )}
                </div>
              ))}
              <p className="text-xs text-neutral-400">Đáp án được tô viền đậm là đáp án đúng</p>
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex gap-2 mt-2">
              <Button variant="secondary" className="flex-1" onClick={closeModal} disabled={saving}>
                Hủy
              </Button>
              <Button className="flex-1" loading={saving} onClick={handleSave}>
                {editQuestion ? "Lưu thay đổi" : "Thêm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionListPage;
