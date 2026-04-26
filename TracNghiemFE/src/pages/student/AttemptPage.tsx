//src/pages/student/AttemptPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { getAttempt, getAttemptQuestions, submitAnswer, submitAttempt, recordTabSwitch, type Attempt, type AttemptQuestion } from "../../api/attempts.api";

const AttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const attemptId = Number(id);

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // question_id → answer_id
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // giây
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== INIT =====
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [attemptRes, questionsRes] = await Promise.all([getAttempt(attemptId), getAttemptQuestions(attemptId)]);
        setAttempt(attemptRes.data);
        setQuestions(questionsRes.data);

        const duration = attemptRes.data.duration_seconds;
        const elapsed = Math.floor((Date.now() - new Date(attemptRes.data.start_time).getTime()) / 1000);
        const remaining = Math.max(duration - elapsed, 0);
        setTimeLeft(remaining);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [attemptId]);

  // ===== TIMER =====
  useEffect(() => {
    if (timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true); // tự nộp khi hết giờ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [timeLeft > 0]);

  // ===== TAB SWITCH =====
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && attempt?.status === "in_progress") {
        recordTabSwitch(attemptId).catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attempt]);

  // ===== ANSWER =====
  const handleAnswer = async (questionId: number, answerId: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    try {
      await submitAnswer(attemptId, questionId, answerId);
    } catch {
      /* empty */
    }
  };

  // ===== SUBMIT =====
  const handleSubmit = async (auto = false) => {
    if (!auto && !confirm("Bạn có chắc muốn nộp bài?")) return;
    clearInterval(timerRef.current!);
    setSubmitting(true);
    try {
      await submitAttempt(attemptId);
      navigate(`/student/result/${attemptId}`);
    } catch {
      setSubmitting(false);
    }
  };

  // ===== FORMAT TIME =====
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];

  if (loading) return <div className="text-sm text-neutral-400 text-center py-20">Đang tải đề thi...</div>;
  if (!attempt || !currentQuestion) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-sm font-semibold text-black">Đang làm bài thi</p>
          <p className="text-xs text-neutral-400">
            Đã trả lời {answeredCount} / {questions.length} câu
          </p>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-lg
          ${timeLeft <= 300 ? "bg-red-50 text-red-600" : "bg-neutral-100 text-black"}`}
        >
          {formatTime(timeLeft)}
        </div>

        <Button variant="primary" loading={submitting} onClick={() => handleSubmit(false)}>
          Nộp bài
        </Button>
      </header>

      <div className="flex flex-1 max-w mx-auto w-full gap-6 p-6">
        {/* ===== CÂU HỎI ===== */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Câu hỏi hiện tại */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6 flex flex-col gap-5">
            {/* Số thứ tự */}
            <p className="text-xs text-neutral-400 font-medium">
              Câu {currentIndex + 1} / {questions.length}
            </p>

            {/* Nội dung câu hỏi */}
            <p className="text-base font-medium text-black leading-relaxed">{currentQuestion.content}</p>

            {/* Đáp án */}
            <div className="flex flex-col gap-2">
              {currentQuestion.answers.map((answer, aIndex) => {
                const isSelected = answers[currentQuestion.question_id] === answer.id;
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleAnswer(currentQuestion.question_id, answer.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-all
                      ${isSelected ? "border-black bg-black text-white" : "border-neutral-200 bg-white text-black hover:border-neutral-400 hover:bg-neutral-50"}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${isSelected ? "border-white text-white" : "border-neutral-300 text-neutral-500"}`}
                    >
                      {String.fromCharCode(65 + aIndex)}
                    </span>
                    {answer.content}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Điều hướng prev/next */}
          <div className="flex justify-between">
            <Button variant="secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}>
              ← Câu trước
            </Button>
            <Button variant="secondary" disabled={currentIndex === questions.length - 1} onClick={() => setCurrentIndex(i => i + 1)}>
              Câu tiếp →
            </Button>
          </div>
        </div>

        {/* ===== BẢNG SỐ CÂU ===== */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sticky top-24">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Danh sách câu hỏi</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, index) => {
                const isAnswered = !!answers[q.question_id];
                const isCurrent = index === currentIndex;
                return (
                  <button
                    key={q.question_id}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-8 w-full rounded text-xs font-medium transition-all
                      ${isCurrent ? "bg-black text-white" : isAnswered ? "bg-green-500 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Chú thích */}
            <div className="flex flex-col gap-1.5 mt-4 pt-5 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-black flex-shrink-0" />
                Câu hiện tại
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-green-500 flex-shrink-0" />
                Đã trả lời
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-neutral-100 flex-shrink-0" />
                Chưa trả lời
              </div>
            </div>

            {/* Tiến độ */}
            <div className="mt-4 pt-5">
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Tiến độ</span>
                <span>
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptPage;
