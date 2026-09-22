import { useQuery } from "@tanstack/react-query";
import axios from "../utils/config"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { problem } from "./Problem";

type filterType = {
    page: number,
    limit: number,
    completed: undefined | "Solved" | "Unsolved"
}

type filterState = [filterType, React.Dispatch<React.SetStateAction<filterType>>]

function Problems() {
    const [filter, setFilter] = useState({
        page: 1,
        limit: 10,
        completed: undefined
    }) as filterState;

    

    return <div className="problems-page">
        <header className="problems-header">
            <div>
                <span className="eyebrow">Problem set</span>
                <h1>Practice problems</h1>
                <p>Choose a challenge, write a solution, and keep your momentum.</p>
            </div>
            <div className="filter-control">
                <label htmlFor="completion-filter">Show</label>
                <select name="" id="completion-filter" value={filter.completed || ""} onChange={(e) => setFilter(prev => {return {...prev, completed: e.target.value === ""? undefined: e.target.value as "Solved" | "Unsolved" }})}>
                <option value="">All</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
                </select>
            </div>
        </header>
        <ProbsList filter={filter}/>
        <nav className="pagination" aria-label="Problem pages">
            <button className="secondary-button" onClick={() => setFilter(prev => {return {...prev, page: prev.page - 1}})} disabled={filter.page === 1}>Previous</button>
            <span>Page {filter.page}</span>
            <button className="secondary-button" onClick={() => setFilter(prev => {return {...prev, page: prev.page + 1}})}>Next</button>
        </nav>
    </div>
}

type queryResponse = {
    data: {probs: problem[], total: number}
    isLoading: boolean,
    error: Error | null
}

export function ProbsList({filter}: {filter: filterType}) {
    const {data, isLoading, error}  = useQuery({
        queryKey: ["problems"],
        queryFn: async () => {
            const res =  await axios.get("/api/problems", {
                withCredentials: true,
                params: {
                    page: filter.page,
                    limit: filter.limit,
                    solved: filter.completed === "Solved" ? true : filter.completed === "Unsolved" ? false : undefined
                }
            })

            return res.data.data;
        }
    }) as queryResponse;
    const navigate = useNavigate();

    if (isLoading) {
        return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Loading problems...</span></div>
    }

    if (error) {
        if (error.toString().includes("401")) navigate("/")
        return <div className="state-card state-error"><span className="state-icon" aria-hidden="true">!</span><span>Error - {`${error}`}</span></div>
    }

    return <div className="problem-grid">
            {data.probs.map((prob) => 
                <Problem prob={prob}/>
            )}
    </div>
}

function Problem({prob}: {prob: problem}) {
    const navigate = useNavigate();
    return <div className="problem-card" key={prob.id} onClick={() => navigate(`/problems/${prob.id}`)}>
        <span className="problem-number">{String(prob.id).padStart(2, "0")}</span>
        <span className="problem-card-copy">
            <strong>{prob.title}</strong>
            <small>Open challenge</small>
        </span>
        <span className="problem-arrow" aria-hidden="true">↗</span>
    </div>
}

export default Problems;
