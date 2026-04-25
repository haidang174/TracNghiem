import { useState } from "react";
import { useQuestions } from "../../../hooks/useQuetions";
import { useSubjects } from "../../../hooks/useSubjects";

export default function QuestionListPage() {
  const { subjects } = useSubjects();
  const [subjectId, setSubjectId] = useState<number | undefined>();

  const { questions } = useQuestions(subjectId);

  return (
    <div>
      <h2>Danh sách câu hỏi</h2>

      {/* filter */}
      <select onChange={(e) => setSubjectId(Number(e.target.value))}>
        <option value="">Tất cả môn</option>
        {subjects.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <hr />

      {questions.map((q: any) => (
        <div key={q.id}>
          <b>{q.content}</b>

          <ul>
            {q.answers?.map((a: any) => (
              <li key={a.id}>
                {a.content} {a.is_correct ? "(Đáp án đúng)" : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
