//src/pages/teacher/sessions/SessionDetailPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button";
import { getSessionById, getSessionStudents, updateSessionStatus, type Session, type SessionStudent } from "../../../api/sessions.api";
import { getSessionResults, getSessionStats, type SessionResult, type SessionStats } from "../../../api/results.api";

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

const SessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [students, setStudents] = useState<SessionStudent[]>([]);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "results" | "stats">("students");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const sessionRes = await getSessionById(Number(id));
      setSession(sessionRes.data);

      const [studentsRes, resultsRes, statsRes] = await Promise.all([getSessionStudents(Number(id)), getSessionResults(Number(id)), getSessionStats(Number(id))]);
      setStudents(studentsRes.data);
      setResults(resultsRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!session) return;
    const next = NEXT_STATUS[session.status];
    if (!next) return;
    if (!confirm(`${NEXT_STATUS_LABEL[session.status]} phòng thi "${session.title}"?`)) return;
    try {
      await updateSessionStatus(session.id, next);
      fetchAll();
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra.");
    }
  };

  if (loading) return <div className="text-sm text-neutral-400">Đang tải...</div>;
  if (!session) return <div className="text-sm text-neutral-400">Không tìm thấy phòng thi.</div>;

  return (
    <div className="flex flex-col gap-6 max-w">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/teacher/sessions")} className="text-sm text-neutral-400 hover:text-black mb-1 flex items-center gap-1">
            ← Quay lại
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-black">{session.title}</h1>
            <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLE[session.status]}`}>{STATUS_LABEL[session.status]}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">{session.exam_title}</p>
        </div>
        {session.status !== "closed" && (
          <Button variant={session.status === "active" ? "danger" : "primary"} onClick={handleUpdateStatus}>
            {NEXT_STATUS_LABEL[session.status]}
          </Button>
        )}
      </div>
      {err && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">{err}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 text-lg leading-none">
            ×
          </button>
        </div>
      )}

      {/* Thông tin phòng thi */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Đề thi</span>
            <span className="font-medium text-black">{session.exam_title}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Trạng thái</span>
            <span className="font-medium text-black">{STATUS_LABEL[session.status]}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400">Ngày tạo</span>
            <span className="font-medium text-black">{new Date(session.created_at).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </div>

      {/* Stats cards — chỉ hiện khi có kết quả */}
      {stats && results.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Học sinh", value: stats.total_students },
            { label: "Đã nộp bài", value: stats.submitted_count },
            { label: "Điểm TB", value: stats.average_score.toFixed(1) },
            { label: "Điểm cao nhất", value: stats.highest_score.toFixed(1) }
          ].map(item => (
            <div key={item.label} className="bg-white border border-neutral-200 rounded-xl p-4">
              <p className="text-xs text-neutral-400 mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-black">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b border-neutral-200">
          {(
            [
              { key: "students", label: `Học sinh (${students.length})` },
              { key: "results", label: `Kết quả (${results.length})` },
              { key: "stats", label: "Thống kê" }
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.key ? "border-black text-black" : "border-transparent text-neutral-400 hover:text-black"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Học sinh */}
        {activeTab === "students" && (
          <div className="divide-y divide-neutral-100">
            {students.length === 0 ? (
              <p className="text-center py-10 text-sm text-neutral-400">Chưa có học sinh trong phòng thi</p>
            ) : (
              students.map(s => (
                <div key={s.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-black">{s.student_name}</p>
                    <p className="text-xs text-neutral-400">{s.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Kết quả */}
        {activeTab === "results" && (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-600">Học sinh</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-600">Điểm</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-600">Số câu đúng</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-600">Thời gian làm</th>
                <th className="text-left px-6 py-3 font-medium text-neutral-600">Nộp lúc</th>
                <th className="text-right px-6 py-3 font-medium text-neutral-600">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-neutral-400">
                    Chưa có kết quả
                  </td>
                </tr>
              ) : (
                results.map(r => (
                  <tr key={r.attempt_id} className="border-t border-neutral-100 hover:bg-neutral-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-black">{r.full_name}</p>
                      <p className="text-xs text-neutral-400">{r.username}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`font-bold text-base ${r.score >= 5 ? "text-green-600" : "text-red-500"}`}>{r.score.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-3 text-neutral-600">
                      {r.correct_count} / {r.total_questions}
                    </td>
                    <td className="px-6 py-3 text-neutral-600">
                      {Math.floor(r.duration_seconds / 60)}p {r.duration_seconds % 60}s
                    </td>
                    <td className="px-6 py-3 text-neutral-500">{new Date(r.submitted_at).toLocaleString("vi-VN")}</td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/attempts/${r.attempt_id}/result`)}>
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Tab: Thống kê */}
        {activeTab === "stats" && (
          <div className="p-6">
            {!stats || results.length === 0 ? (
              <p className="text-center py-6 text-sm text-neutral-400">Chưa có dữ liệu thống kê</p>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Tổng quan */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">Điểm thấp nhất</span>
                    <span className="font-medium text-black">{stats.lowest_score.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">Điểm cao nhất</span>
                    <span className="font-medium text-black">{stats.highest_score.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">Điểm trung bình</span>
                    <span className="font-medium text-black">{stats.average_score.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-neutral-400">Tỉ lệ nộp bài</span>
                    <span className="font-medium text-black">
                      {stats.submitted_count} / {stats.total_students} học sinh
                    </span>
                  </div>
                </div>

                {/* Phân phối điểm */}
                <div>
                  <p className="text-sm font-semibold text-neutral-700 mb-3">Phân phối điểm số</p>
                  <div className="flex flex-col gap-2">
                    {stats.distribution.map(d => {
                      const percent = stats.submitted_count > 0 ? Math.round((d.count / stats.submitted_count) * 100) : 0;
                      return (
                        <div key={d.range} className="flex items-center gap-3 text-sm">
                          <span className="w-12 text-right text-neutral-500 flex-shrink-0">{d.range}</span>
                          <div className="flex-1 bg-neutral-100 rounded-full h-5 overflow-hidden">
                            <div className="bg-black h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                          </div>
                          <span className="w-16 text-neutral-500 flex-shrink-0">
                            {d.count} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetailPage;
