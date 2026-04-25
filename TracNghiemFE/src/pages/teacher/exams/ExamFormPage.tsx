//src/pages/teacher/exams/ExamFormPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { getExamById, createExam, updateExam, type CreateExamRequest } from "../../../api/exams.api";
import { getSubjects, type Subject } from "../../../api/subjects.api";

const EMPTY_FORM: CreateExamRequest = {
  title: "",
  subject_id: 0,
  duration: 45,
  question_count: 40,
  variant_count: 1
};

const ExamFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState<CreateExamRequest>(EMPTY_FORM);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load subjects + exam nếu là edit
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const subRes = await getSubjects({ limit: 100 });
        setSubjects(subRes.data.data);

        if (isEdit) {
          const exam = await getExamById(Number(id));
          setForm({
            title: exam.data.title,
            subject_id: exam.data.subject_id,
            duration: exam.data.duration,
            question_count: exam.data.question_count,
            variant_count: exam.data.variant_count
          });
        }
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSave = async () => {
    if (!form.title || !form.subject_id) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (form.duration <= 0 || form.question_count <= 0) {
      setError("Thời gian và số câu phải lớn hơn 0.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        await updateExam(Number(id), form);
      } else {
        await createExam(form);
      }
      navigate("/teacher/exams");
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-neutral-400 text-sm">Đang tải...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-black">{isEdit ? "Sửa đề thi" : "Thêm đề thi"}</h1>
        <p className="text-sm text-neutral-500">{isEdit ? "Cập nhật thông tin đề thi" : "Nhập thông tin đề thi mới"}</p>
      </div>

      {/* Form */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-4">
        <Input id="title" label="Tên đề thi" placeholder="Nhập tên đề thi" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

        {/* Subject select */}
        <div className="flex flex-col gap-1">
          <label htmlFor="subject" className="text-sm font-medium text-neutral-700">
            Môn học <span className="ml-1 text-black">*</span>
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

        <div className="flex flex-col gap-4">
          <Input
            id="duration"
            label="Thời gian (phút)"
            type="number"
            value={form.duration}
            onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
            required
            className="flex-1"
          />
          <Input
            id="question_count"
            label="Số câu hỏi"
            type="number"
            value={form.question_count}
            onChange={e => setForm({ ...form, question_count: Number(e.target.value) })}
            required
            className="flex-1"
          />
          <Input
            id="variant_count"
            label="Số mã đề"
            type="number"
            value={form.variant_count}
            onChange={e => setForm({ ...form, variant_count: Number(e.target.value) })}
            required
            className="flex-1"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2 mt-2">
          <Button variant="secondary" className="flex-1" onClick={() => navigate("/teacher/exams")} disabled={saving}>
            Hủy
          </Button>
          <Button className="flex-1" loading={saving} onClick={handleSave}>
            {isEdit ? "Lưu thay đổi" : "Tạo đề thi"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamFormPage;
