import { useState } from "react";
import {useSubjects} from "../../../hooks/useSubjects";


export default function SubjectListPage() {
  const { subjects, createSubject, deleteSubject } = useSubjects();
  const[name,setName ] = useState("");


  const handleCreate = async() => {
    if(!name) return;
    await createSubject(name);
    setName("");
  };

  return (
    <div>
      <h2>Quản lý môn học</h2>

      <div style={{marginBottom:20}}>
        <input value={name}
        onChange = {(e) => setName(e.target.value)}
        placeholder="Tên môn"
        />

        <button onClick={handleCreate}>Thêm môn học</button>
      </div>

      {subjects.map((subject: any) => (
        <div key={subject.id} style={{marginBottom:10}}>
          {subject.name}
          <button onClick={() => deleteSubject(subject.id)}>Xóa</button>
        </div>
      ))}
    </div>
  );
}