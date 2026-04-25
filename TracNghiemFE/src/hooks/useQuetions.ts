import { useEffect,useState } from "react";
import { getQuestionsApi } from "../api/questions.api";

export function useQuestions(subject_id?: number) {
    const  [questions, setQuestions] = useState([]);
    const [loanding, setLoading] = useState(false);

    const fetchQuestions = async() => {
        setLoading(true);
        try {
            const res = await getQuestionsApi(subject_id);
            setQuestions(res.data);
        }finally{
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchQuestions();
    }, [subject_id]);

    return {
        questions,
        setQuestions,
        fetchQuestions,
        loanding
    }
};