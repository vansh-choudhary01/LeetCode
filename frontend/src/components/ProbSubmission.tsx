import axios from "axios";
import { useEffect, useState } from "react";

type submission = {
  id: number,
  userId: number,
  problemId: string,
  code:  string
  language: string
  resultStatus?: boolean
  result?: {
    status: 'Failed' | 'Accepted'
    pass: string,
    error: string
  }
} | null;

type submissionState = [submission, React.Dispatch<React.SetStateAction<submission>>]

function getSubmission() {
    const probId = window.location.origin.split("/problems/")[1].split("/")[0];
    const submissionId = window.location.origin.split("/problems/")[1].split("/")[1];

    return { probId, submissionId };
}

function ProbSubmission() {
    const { probId, submissionId } = getSubmission();
    const [submission, setSubmission] = useState(null) as submissionState;
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let intervalId = setInterval(async () => {
            try {
                const res = await axios.get(`/api/problems/submission/${submissionId}`);

                if (res.data.data.resultStatus) {
                    clearInterval(intervalId);
                    setSubmission(res.data.data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error(err);
            }
        }, 2000);
    }, []);

    if (isLoading) return <div>Submission</div>

    return <>
        <div>
            <span>{submission?.resultStatus}</span>
            <span>{submission?.result?.error}</span>
            <span>{submission?.result?.pass}</span>
            <code lang={submission?.language}>{submission?.code}</code>
        </div>
    </>
}

export default ProbSubmission;