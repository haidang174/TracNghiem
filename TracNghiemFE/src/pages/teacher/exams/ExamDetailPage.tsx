//src/pages/teacher/exams/ExamDetailPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { getExamById, type Exam } from "../../../api/exams.api";
import client from "../../../api/client";

const ExamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [variantQuestions, setVariantQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const res = await getExamById(Number(id));
      setExam(res.data);

      const varRes = (await client.get(`/exams/${id}/variants`)) as any;
      setVariants(varRes.data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [id]);

  const handleSelectVariant = async (variantId: number) => {
    setSelectedVariant(variantId);
    try {
      const res = (await client.get(`/exams/${id}/variants/${variantId}/questions`)) as any;
      setVariantQuestions(res.data || []);
    } catch {
      /* empty */
    }
  };

  const handleGenerate = async () => {
    if (!confirm("Tạo mã đề sẽ xóa các mã đề cũ. Tiếp tục?")) return;
    setGenerating(true);
    setError("");
    try {
      await client.post(`/exams/${id}/generate-variants`);
      await fetchExam();
      setSelectedVariant(null);
      setVariantQuestions([]);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-sm text-neutral-400">Đang tải...</div>;
  if (!exam) return <div className="text-sm text-neutral-400">Không tìm thấy đề thi.</div>;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/teacher/exams")} className="text-sm text-neutral-400 hover:text-black mb-1 flex items-center gap-1">
            ← Quay lại
          </button>
          <h1 className="text-xl font-bold text-black">{exam.title}</h1>
          <p className="text-sm text-neutral-500">{exam.subject_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/teacher/exams/${id}/edit`)}>
            Chỉnh sửa
          </Button>
          <Button loading={generating} onClick={handleGenerate}>
            Tạo mã đề
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Thông tin */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Môn học</span>
            <span className="font-medium text-black">{exam.subject_name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Số câu hỏi</span>
            <span className="font-medium text-black">{exam.question_count} câu</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Thời gian</span>
            <span className="font-medium text-black">{exam.duration} phút</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Số mã đề</span>
            <span className="font-medium text-black">{exam.variant_count} mã</span>
          </div>
        </div>
      </div>

      {/* Mã đề */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-700">Mã đề</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Nhấn vào mã đề để xem câu hỏi</p>
        </div>

        {variants.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-400">Chưa có mã đề nào. Nhấn "Tạo mã đề" để tạo.</div>
        ) : (
          <div className="flex gap-2 px-6 py-4 flex-wrap">
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => handleSelectVariant(v.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors
                  ${selectedVariant === v.id ? "bg-black text-white border-black" : "border-neutral-200 text-neutral-700 hover:border-black"}`}
              >
                Mã đề {v.variant_code}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Câu hỏi theo mã đề */}
      {selectedVariant && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-700">Câu hỏi — Mã đề {variants.find(v => v.id === selectedVariant)?.variant_code}</h2>
          </div>

          {variantQuestions.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-neutral-400">Không có câu hỏi.</div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {variantQuestions.map((vq, index) => (
                <div key={vq.question_id} className="px-6 py-4">
                  <p className="text-sm font-medium text-black mb-3">
                    <span className="text-neutral-400 mr-2">#{index + 1} </span>
                    {vq.content}
                  </p>
                  <div className="flex flex-col gap-2 pl-6 pt-2">
                    {vq.answers.map((answer: any, aIndex: number) => (
                      <div key={aIndex} className="flex items-center gap-2 text-sm text-neutral-500">
                        <span className="w-5 h-5 rounded-full border border-neutral-300 flex items-center justify-center text-xs flex-shrink-0">
                          {String.fromCharCode(65 + aIndex)}
                        </span>
                        {answer.content}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamDetailPage;
