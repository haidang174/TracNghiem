import { useState } from "react";
import { createQuestionApi } from "../../../api/questions.api";
import { useSubjects } from "../../../hooks/useSubjects";

export default function QuestionFormPage() {
  const { subjects } = useSubjects();
  const [content, setContent] = useState("");
  const [subjectId, setSubjectId] = useState<number | null>(null);

  const [answers, setAnswers] = useState([
    { content: "", is_correct: false },
  ]);

  const addAnswer = () => { setAnswers([...answers, { content: "", is_correct: false }]) };

  const updateAnswer = (index: number, field: string, value: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!subjectId) return alert("Chọn môn");
    const correctCount = answers.filter(a => a.is_correct).length;

    if (correctCount !== 1) return alert("Chọn đúng 1 đáp án đúng");

    await createQuestionApi({ subjectId: subjectId, content, answers });
    alert("Tạo thành công");
  };
  return (
    <div>
      <h2>Tạo câu hỏi</h2>
      <select onChange={(e) => setSubjectId(Number(e.target.value))}>
        <option value="">Chọn môn học</option>
        {subjects.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <br />

      <input
        placeholder="Nội dung câu hỏi"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <h3>Đáp án</h3>

      {answers.map((a, index) => (
        <div key={index}>
          <input
            placeholder="Đáp án"
            value={a.content}
            onChange={(e) =>
              updateAnswer(index, "content", e.target.value)
            }
          />

          <input
            type="radio"
            name="correct"
            checked={a.is_correct}
            onChange={() => {
              const newAnswers = answers.map((ans, i) => ({
                ...ans,
                is_correct: i === index,
              }));
              setAnswers(newAnswers);
            }}
          />
          Đúng
        </div>
      ))}

      <button onClick={addAnswer}>+ Thêm đáp án</button>

      <br /><br />

      <button onClick={handleSubmit}>Submit</button>
    </div>

  );

}
