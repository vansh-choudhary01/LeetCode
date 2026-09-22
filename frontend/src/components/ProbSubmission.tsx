import axios from "../utils/config"
import { useEffect, useState } from "react";

export type submission = {
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
    const probId = window.location.pathname.split("/problems/")[1].split("/")[0];
    const submissionId = window.location.pathname.split("/problems/")[1].split("/")[1];

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

                if (res.data.data.resultStatus === true || res.data.data.resultStatus === false) {
                    clearInterval(intervalId);
                    setSubmission(res.data.data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error(err);
                clearInterval(intervalId);
                setIsLoading(false);
                setSubmission({
                    id: 0,
                    userId: 0,
                    problemId: probId,
                    code: '',
                    language: '',
                    resultStatus: undefined,
                    result: undefined
                });
            }
        }, 2000);
    }, []);

    if (isLoading) return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Running your submission...</span></div>

    return <div className="submission-page">
        <header className="submission-heading">
            <span className="eyebrow">Submission result</span>
            <h1>Review your run</h1>
            <span className={`result-badge ${submission?.result?.status === "Accepted" ? "result-accepted" : "result-failed"}`}>
                {submission?.result?.status || submission?.resultStatus}
            </span>
        </header>
        <div className="submission-card">
            <div className="submission-summary">
                <div><span>Passed</span><strong>{submission?.result?.pass || "0"}</strong></div>
                <div><span>Language</span><strong>{submission?.language}</strong></div>
            </div>
            {submission?.result?.error && <div className="submission-error">{submission.result.error}</div>}
            <div className="submission-code-header">Submitted code</div>
            <code className="submission-code" lang={submission?.language}>{submission?.code}</code>
        </div>
    </div>
}

export default ProbSubmission;
