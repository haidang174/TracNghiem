import { useEffect,useState } from "react";

import{
    getSubjects,
    createSubjectApi,
    deleteSubjectApi,
} from "../api/subjects.api";

export function useSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [loanding, setLoading] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await getSubjects();
            setSubjects(res.data);
        }finally{
            setLoading(false);
        }
        
    }

    const createSubject = async(name: string) => {
        await createSubjectApi({name});
        await fetchSubjects();
    }

    const deleteSubject = async(id: number) => {
        await deleteSubjectApi(id);
        await fetchSubjects();
    }

    useEffect(() => {
        fetchSubjects();
    }, []);

    return{
        subjects,
        setSubjects,
        createSubject,
        deleteSubject
    }
}