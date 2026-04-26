//src/pages/teacher/sessions/SessionResultPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { getAttemptResult, type AttemptResult } from "../../../api/results.api";

const SessionResultPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAttemptResult(Number(attemptId));
        setResult(res.data);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [attemptId]);

  if (loading) return <div className="text-sm text-neutral-400 text-center py-20">Đang tải...</div>;
  if (!result) return <div className="text-sm text-neutral-400 text-center py-20">Không tìm thấy kết quả.</div>;

  const isPassed = result.score >= 5;
  const percent = Math.round((result.correct_count / result.total_count) * 100);
  const durationMs = new Date(result.end_time).getTime() - new Date(result.start_time).getTime();
  const durationSec = Math.floor(durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  return (
    <div className="flex flex-col gap-6 max-w">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-neutral-400 hover:text-black mb-1 flex items-center gap-1">
          ← Quay lại
        </button>
        <h1 className="text-xl font-bold text-black">Kết quả bài làm</h1>
        <p className="text-sm text-neutral-500">
          {result.session_title} · {result.exam_title}
        </p>
      </div>

      {/* Thông tin học sinh + điểm */}
      <div
        className={`bg-white border rounded-xl p-6 flex items-center gap-6
        ${isPassed ? "border-green-200" : "border-red-200"}`}
      >
        {/* Điểm */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 flex-shrink-0
          ${isPassed ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"}`}
        >
          <span className={`text-3xl font-bold ${isPassed ? "text-green-600" : "text-red-500"}`}>{result.score.toFixed(1)}</span>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-semibold text-black text-base">{result.full_name}</p>
          <p className={`text-sm font-medium ${isPassed ? "text-green-600" : "text-red-500"}`}>{isPassed ? "✓ Đạt" : "✗ Chưa đạt"}</p>
          <div className="flex gap-4 text-sm text-neutral-500 mt-1">
            <span>
              {result.correct_count} / {result.total_count} câu đúng ({percent}%)
            </span>
            <span>·</span>
            <span>
              Thời gian: {minutes}p {seconds}s
            </span>
          </div>
          <p className="text-xs text-neutral-400">Nộp lúc {new Date(result.end_time).toLocaleString("vi-VN")}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 text-center text-sm flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-bold text-green-600">{result.correct_count}</span>
            <span className="text-xs text-neutral-400">Câu đúng</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xl font-bold text-red-500">{result.total_count - result.correct_count}</span>
            <span className="text-xs text-neutral-400">Câu sai</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Tỉ lệ đúng</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500
              ${isPassed ? "bg-green-500" : "bg-red-400"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Chi tiết từng câu */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-700">
            Chi tiết từng câu
            <span className="ml-2 font-normal text-neutral-400">({result.total_count} câu)</span>
          </h2>
        </div>

        <div className="divide-y divide-neutral-100">
          {result.answers.map((a, index) => (
            <div key={a.question_id} className="px-6 py-4 flex flex-col gap-3">
              {/* Tiêu đề câu */}
              <div className="flex items-start gap-3">
                <p className="text-sm font-medium text-black leading-relaxed">
                  <span className="text-neutral-400 mr-1.5">#{index + 1} </span>
                  {a.content}
                </p>
              </div>

              {/* Đáp án */}
              <div className="pl-9 flex flex-col gap-1.5">
                {/* Đáp án học sinh chọn */}
                <div
                  className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg
                  ${a.is_correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                >
                  <div>
                    <span className="text-xs opacity-70 block mb-0.5">Học sinh chọn:</span>
                    {a.selected_answer_content}
                  </div>
                </div>

                {/* Đáp án đúng — chỉ hiện khi sai */}
                {!a.is_correct && (
                  <div className="flex items-start gap-2 text-sm px-3 py-2 rounded-lg bg-green-50 text-green-700">
                    <div>
                      <span className="text-xs opacity-70 block mb-0.5">Đáp án đúng:</span>
                      {a.correct_answer_content}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nút in / xuất */}
      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default SessionResultPage;
