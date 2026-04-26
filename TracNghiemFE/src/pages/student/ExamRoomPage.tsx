//src/pages/student/ExamRoomPage.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { getMyRooms } from "../../api/examroom.api";
import { startAttempt } from "../../api/attempts.api";
import type { Session } from "../../api/sessions.api";

const STATUS_LABEL: Record<string, string> = {
  draft: "Chưa mở",
  active: "Đang diễn ra",
  closed: "Đã kết thúc"
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-500",
  active: "bg-green-50 text-green-700",
  closed: "bg-red-50 text-red-500"
};

const ExamRoomPage = () => {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getMyRooms();
        setRooms(res.data.data);
      } catch {
        /* empty */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStart = async (sessionId: number) => {
    if (!confirm("Bạn có chắc muốn bắt đầu làm bài? Thời gian sẽ bắt đầu tính ngay.")) return;
    setStartingId(sessionId);
    setError("");
    try {
      const attempt = await startAttempt(sessionId);
      navigate(`/student/attempt/${attempt.id}`);
    } catch (err: any) {
      setError(err?.message || "Không thể bắt đầu thi, vui lòng thử lại.");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-black">Phòng thi của tôi</h1>
        <p className="text-sm text-neutral-500">Danh sách các phòng thi bạn được tham gia</p>
      </div>

      {error && <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      {/* Danh sách phòng thi */}
      {loading ? (
        <p className="text-sm text-neutral-400 text-center py-10">Đang tải...</p>
      ) : rooms.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl px-6 py-12 text-center">
          <p className="text-neutral-400 text-sm">Bạn chưa được thêm vào phòng thi nào.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rooms.map(room => (
            <div key={room.id} className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center justify-between">
              {/* Thông tin phòng */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-black">{room.title}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[room.status]}`}>{STATUS_LABEL[room.status]}</span>
                </div>
                <p className="text-sm text-neutral-500">{room.exam_title}</p>
                <p className="text-xs text-neutral-400">Ngày tạo: {new Date(room.created_at).toLocaleDateString("vi-VN")}</p>
              </div>

              {/* Action */}
              <div className="flex-shrink-0 ml-4">
                {room.status === "active" && (
                  <Button loading={startingId === room.id} onClick={() => handleStart(room.id)}>
                    Vào thi
                  </Button>
                )}
                {room.status === "closed" && (
                  <Button variant="secondary" onClick={() => navigate(`/student/result/${room.id}`)}>
                    Xem kết quả
                  </Button>
                )}
                {room.status === "draft" && <span className="text-sm text-neutral-400">Chưa mở</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamRoomPage;
