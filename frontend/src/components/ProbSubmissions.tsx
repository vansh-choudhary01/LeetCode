import { useQuery } from "@tanstack/react-query";
import axios from "../utils/config"
import type { submission } from "./ProbSubmission";
import { useState } from "react";

export function getProbId() {
    const probId = window.location.pathname.split("/problems/")[1].split("/")[0];
    return probId;
}

function ProbSubmissions() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["submissions"],
        queryFn: async () => {
            const probId = getProbId();
            const res = await axios.get(`/api/problems/${probId}/submission`, {
                withCredentials: true
            })

            return res.data.data;
        }
    }) as { data: submission[], isLoading: boolean, error: Error | null }
    const [currSub, setCurrSub] = useState<submission | null>(null);

    if (isLoading) return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Loading submissions...</span></div>

    if (error) {
        return <div className="state-card state-error"><span className="state-icon" aria-hidden="true">!</span><span>Error - {`${error}`}</span></div>
    }

    if (data.length === 0) {
        return <div className="state-card"><span className="state-icon" aria-hidden="true">!</span><span>No submissions found</span></div>
    }

    if (currSub) {
        return <ProbSubmission submission={currSub} />
    }
    
    return <div className="submissions-page">
        <header className="submissions-heading">
            <span className="eyebrow">Submissions</span>
            <h1>Review your submissions</h1>
        </header>
        <div className="submissions-grid">
            {data.map((submission) => {
                return <div className="submission-card" key={submission?.id}>
                    <div className="submission-summary">
                        <div><span>Language</span><strong>{submission?.language}</strong></div>
                        <div><span>Result</span><strong>{submission?.result?.status || submission?.resultStatus}</strong></div>
                    </div>
                    <span className="secondary-button" onClick={() => setCurrSub(submission)}>View submission</span>
                </div>
            })}
        </div>
    </div>
}

function ProbSubmission({submission}: { submission: submission }) {
    return <div className="submission-page">
        <header className="submission-heading">
            <span className="eyebrow">Submission</span>
            <h1>Review your submission</h1>
        </header>
        <div className="submission-details">
            <div><span>Language</span><strong>{submission?.language}</strong></div>
            <div><span>Result</span><strong>{submission?.result?.status || submission?.resultStatus}</strong></div>
        </div>
        <pre className="submission-code">{submission?.code}</pre>
    </div>
}

export default ProbSubmissions;