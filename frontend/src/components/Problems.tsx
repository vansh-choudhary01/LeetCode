import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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

    

    return <>
        <div>
            <select name="" id="" value={filter.completed || ""} onChange={(e) => setFilter(prev => {return {...prev, completed: e.target.value === ""? undefined: e.target.value as "Solved" | "Unsolved" }})}>
                <option value="">All</option>
                <option value="Solved">Solved</option>
                <option value="Unsolved">Unsolved</option>
            </select>
        </div>
        <ProbsList filter={filter}/>
        <div>
            <button onClick={() => setFilter(prev => {return {...prev, page: prev.page - 1}})} disabled={filter.page === 1}>Prev</button>
            <button onClick={() => setFilter(prev => {return {...prev, page: prev.page + 1}})}>Next</button>
        </div>
    </>
}

type queryResponse = {
    data: problem[],
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

    if (isLoading) {
        return <div>Loading....</div>
    }

    if (error) {
        return <div>Error - {`${error}`}</div>
    }

    return <>
        <div>
            {data.map((prob) => 
                <Problem prob={prob}/>
            )}
        </div>
    </>
}

function Problem({prob}: {prob: problem}) {
    const navigate = useNavigate();
    return <div key={prob.id} onClick={() => navigate(`/problems/${prob.id}`)}>
        <span>{prob.id}</span>
        <span>{prob.title}</span>
    </div>
}

export default Problems;