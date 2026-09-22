import { useQuery, type QueryObserverResult, type RefetchOptions } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type problem = {
    id: number,
    title: string,
    description: string,
    functionName: string,
    returnType: string,
    inputType: string
}

type queryResponse = {
    data: problem,
    isLoading: boolean,
    error: Error | null,
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
}

type lang = 'ts' | 'python'

function findProbId() {
    const probId = window.location.pathname.split("/problems/")[1];

    return probId;
}

function generateBaseCode(lang: lang, functionName: problem["functionName"], returnType: problem["returnType"], inputType: problem["inputType"]) {
    switch(lang) {
        case "ts": return `class Solution {
  public ${returnType} ${functionName}(${inputType}) {
    // write your code here
  }
}
`       
        case "python": `class Solution:
  def ${functionName}(${inputType}) -> ${returnType}:
`
    }
}

type langState = [lang, React.Dispatch<React.SetStateAction<lang>>]

function Problem() {
    const probId = findProbId();
    const [language, setLanguage] = useState("ts") as langState;
    const [code, setCode] = useState('');
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [`prob/${probId}`],
        queryFn: async () => {
            const res = await axios.get(`/api/problems/${probId}`, {
                withCredentials: true
            })

            return res.data.data;
        },
        enabled: false
    }) as queryResponse;
    const navigate = useNavigate();

    useEffect(() => {
        refetch();
    }, []);

    if (isLoading) return <>Loading...</>
    if (error) return <>Error - {error}</>

    function handleSubmit() {
        axios.post(`/api/problems//submission/${probId}`, {
            language, code
        }).then((res) => {
            if (res.status === 200) {
                navigate(`/problems/${probId}/${res.data.data.id}`);
            }
        }).catch(err => {
            alert(err);
        })
    }

    
    return <div className="problem_page">
        //left pannel
        <div className="left-pannel">
            <div>
                <p>{data.id}</p>
                <p>{data.title}</p>
            </div>
            <div>{data.description}</div>
        </div>
        //right pannel
        <div className="right-pannel">
            <div>
                <select onChange={(e) => setLanguage(e.target.value as lang)}>
                    <option value="ts">ts</option>
                    <option value="python">python</option>
                </select>
                <code lang={language} >{generateBaseCode(language, data.functionName, data.returnType, data.inputType)}</code>
                <button onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    </div>
}

export default Problem;