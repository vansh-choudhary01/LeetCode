import { useQuery, type QueryObserverResult, type RefetchOptions } from "@tanstack/react-query";
import axios from "../utils/config"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";

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
    switch (lang) {
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

    if (isLoading || !data) return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Loading challenge...</span></div>
    if (error) return <div className="state-card state-error"><span className="state-icon" aria-hidden="true">!</span><span>Error - {`${error}`}</span></div>

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

    console.log(data);

    return <div className="problem-page">
        <aside className="problem-description">
            <div className="problem-heading">
                <span className="eyebrow">Challenge {data.id}</span>
                <h1>{data.title}</h1>
            </div>
            <div className="description-body">{data.description}</div>
            <div className="problem-tip">
                <span className="tip-icon" aria-hidden="true">✦</span>
                <span>Read the constraints carefully before you code.</span>
            </div>
        </aside>

        <section className="editor-panel">
            <div className="editor-toolbar">
                <div>
                    <span className="editor-title">Solution workspace</span>
                    <span className="editor-subtitle">Write, submit, iterate</span>
                </div>
                <label className="language-control">
                    <span>Language</span>
                    <select value={language} onChange={(e) => setLanguage(e.target.value as lang)}>
                        <option value="ts">ts</option>
                        <option value="python">python</option>
                    </select>
                </label>
            </div>

            <div className="editor-surface">
                <div className="editor-surface-header">
                    <span>Starter code</span>
                    <span className="editor-status"><i></i> Ready to edit</span>
                </div>
                <Editor
                    lang={language}
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => Prism.highlight(code, Prism.languages.js, language)}
                    padding={10}
                    style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                    }}
                />
            </div>

            <div className="editor-footer">
                <span className="editor-hint">Your submission will be evaluated against the test cases.</span>
                <button className="primary-button submit-button" onClick={handleSubmit}>Submit solution <span aria-hidden="true">→</span></button>
            </div>
        </section>
    </div>
}

export default Problem;
