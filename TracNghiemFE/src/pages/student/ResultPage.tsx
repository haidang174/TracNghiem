//src/pages/student/ResultPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { getAttemptResult, type AttemptResult } from "../../api/results.api";

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAttemptResult(Number(id));
        setResult(res.data);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="text-sm text-neutral-400 text-center py-20">Đang tải kết quả...</div>;
  if (!result) return <div className="text-sm text-neutral-400 text-center py-20">Không tìm thấy kết quả.</div>;

  const percent = Math.round((result.correct_count / result.total_count) * 100);
  const isPassed = result.score >= 5;
  const durationMs = new Date(result.end_time).getTime() - new Date(result.start_time).getTime();
  const durationSec = Math.floor(durationMs / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  return (
    <div className="flex flex-col gap-6 max-w mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-black">Kết quả bài thi</h1>
        <p className="text-sm text-neutral-500">
          {result.session_title} · {result.exam_title}
        </p>
      </div>

      {/* Score card */}
      <div
        className={`bg-white border rounded-xl p-8 flex flex-col items-center gap-4
        ${isPassed ? "border-green-200" : "border-red-200"}`}
      >
        {/* Điểm số */}
        <div
          className={`w-28 h-28 rounded-full flex items-center justify-center border-4
          ${isPassed ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50"}`}
        >
          <span className={`text-4xl font-bold ${isPassed ? "text-green-600" : "text-red-500"}`}>{result.score.toFixed(1)}</span>
        </div>

        <div className="text-center">
          <p className="text-sm text-neutral-400 mt-1">
            {result.correct_count} / {result.total_count} câu đúng ({percent}%)
          </p>
        </div>

        {/* Thông tin thêm */}
        <div className="w-full grid grid-cols-3 gap-4 pt-4 border-t border-neutral-100 text-center text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Thời gian làm</span>
            <span className="font-medium text-black">
              {minutes}p {seconds}s
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Câu đúng</span>
            <span className="font-medium text-green-600">{result.correct_count}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Câu sai</span>
            <span className="font-medium text-red-500">{result.total_count - result.correct_count}</span>
          </div>
        </div>
      </div>

      {/* Nộp lúc */}
      <p className="text-xs text-neutral-400 text-center">Nộp bài lúc {new Date(result.end_time).toLocaleString("vi-VN")}</p>

      {/* Toggle chi tiết */}
      <Button variant="secondary" onClick={() => setShowDetail(v => !v)}>
        {showDetail ? "Ẩn chi tiết" : "Xem chi tiết từng câu"}
      </Button>

      {/* Chi tiết từng câu */}
      {showDetail && (
        <div className="flex flex-col gap-3">
          {result.answers.map((a, index) => (
            <div
              key={a.question_id}
              className={`bg-white border rounded-xl p-5 flex flex-col gap-3
                ${a.is_correct ? "border-green-200" : "border-red-200"}`}
            >
              {/* Câu hỏi */}
              <p className="text-sm font-medium text-black">
                <span className="text-neutral-400 mr-2">#{index + 1}</span>
                {a.content}
              </p>

              {/* Đáp án đã chọn */}
              <div
                className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg
                ${a.is_correct ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
              >
                <span className="flex-shrink-0 mt-0.5">{a.is_correct ? "✓" : "✗"}</span>
                <div>
                  <span className="text-xs font-medium opacity-70 block mb-0.5">Bạn chọn:</span>
                  {a.selected_answer_content}
                </div>
              </div>

              {/* Đáp án đúng — chỉ hiện khi sai */}
              {!a.is_correct && (
                <div className="flex items-start gap-2 text-sm px-3 py-2 rounded-lg bg-green-50 text-green-700">
                  <span className="flex-shrink-0 mt-0.5">✓</span>
                  <div>
                    <span className="text-xs font-medium opacity-70 block mb-0.5">Đáp án đúng:</span>
                    {a.correct_answer_content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Nút quay lại */}
      <Button variant="secondary" onClick={() => navigate("/student/room")}>
        ← Quay lại phòng thi
      </Button>
    </div>
  );
};

export default ResultPage;
