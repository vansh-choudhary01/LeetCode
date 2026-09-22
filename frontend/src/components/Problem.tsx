import { useQuery, type QueryObserverResult, type RefetchOptions } from "@tanstack/react-query";
import axios from "../utils/config"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as EditorModule from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-typescript";
import ProbSubmissions from "./ProbSubmissions";

const Editor = (EditorModule.default as unknown as {
    default?: typeof EditorModule.default;
}).default ?? EditorModule.default;

export type problem = {
    id: number,
    title: string,
    description: string,
    functionName: string,
    returnType: string,
    inputType: string,
    tests: {
        input: any,
        expected: any
    }[]
}

type queryResponse = {
    data: problem,
    isLoading: boolean,
    error: Error | null,
    refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<any, Error>>
}

type lang = 'ts' | 'js' | 'python'

const prismLanguage: Record<lang, "typescript" | "javascript" | "python"> = {
    ts: "typescript",
    js: "javascript",
    python: "python",
};

function findProbId() {
    const probId = window.location.pathname.split("/problems/")[1];

    return probId;
}

function normalizeInput(input: problem["inputType"], lang: lang) {
    switch (lang) {
        case "ts":
            return input;
        case "js":
            return '{ ' + input.split("{")[1].split("}")[0].split(",").map((s: string) => s.split(":")[0].trim()).join(", ") + ' }';
    }
}

function generateBaseCode(lang: lang, functionName: problem["functionName"], returnType: problem["returnType"], inputType: problem["inputType"]) {
    switch (lang) {
        case "ts": return `class Solution {
  public ${functionName}(${inputType}): ${returnType} {
    // write your code here
  }
}
`       
        case "js": return `class Solution {
  ${functionName}(${inputType}) {
    // write your code here
  }
}
`
        case "python": return `class Solution:
  def ${functionName}(${inputType}) -> ${returnType}:
    # write your code here
`
    }
}

type langState = [lang, React.Dispatch<React.SetStateAction<lang>>]

function Problem() {
    const [rightPanelType, setRightPanelType] = useState<"editor" | "submissions">("editor");
    const probId = findProbId();
    const [language, setLanguage] = useState("js") as langState;
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

    useEffect(() => {
        if(!data) return;
        setCode(generateBaseCode(language, data.functionName, data.returnType, normalizeInput(data.inputType, language) as string) as string);
    }, [data, language]);

    if (isLoading || !data) return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Loading challenge...</span></div>
    if (error) return <div className="state-card state-error"><span className="state-icon" aria-hidden="true">!</span><span>Error - {`${error}`}</span></div>

    function handleSubmit() {
        axios.post(`/api/problems/submission/${probId}`, {
            language, code
        }, {
            withCredentials: true
        }).then((res) => {
            if (res.status === 200) {
                navigate(`/problems/${probId}/${res.data.data.id}`);
            }
        }).catch(err => {
            alert(err);
        })
    }

    return <div className="problem-page">
        <aside className="problem-description">
            <div className="problem-heading">
                <span className="eyebrow">Challenge {data.id}</span>
                <h1>{data.title}</h1>
            </div>
            <div>
                <div className="problem-actions">
                    <button disabled={rightPanelType === "editor"} className={`secondary-button ${rightPanelType === "editor" ? "active" : ""}`} onClick={() => setRightPanelType("editor")}>Editor</button>
                    <button disabled={rightPanelType === "submissions"} className={`secondary-button ${rightPanelType === "submissions" ? "active" : ""}`} onClick={() => setRightPanelType("submissions")}>Submissions</button>
                </div>
            </div>
            <div className="description-body">{data.description}</div>
            <div className="problem-tests">
                <span className="testcases-title">Test cases</span>
                <div className="testcases-list">
                    {data.tests.map((test, index) => {
                        return <div key={index} className="testcase">
                            <div className="testcase-input">
                                <span className="testcase-label">Input</span>
                                <pre>{JSON.stringify(test.input)}</pre>
                            </div>
                            <div className="testcase-expected">
                                <span className="testcase-label">Expected</span>
                                <pre>{JSON.stringify(test.expected)}</pre>
                            </div>
                        </div>
                    })}
                </div>
            </div>
            <div className="problem-tip">
                <span className="tip-icon" aria-hidden="true">✦</span>
                <span>Read the constraints carefully before you code.</span>
            </div>
        </aside>

        {rightPanelType === "editor" && (
            <section className="editor-panel">
                <div className="editor-toolbar">
                    <div>
                        <span className="editor-title">Solution workspace</span>
                    <span className="editor-subtitle">Write, submit, iterate</span>
                </div>
                <label className="language-control">
                    <span>Language</span>
                    <select value={language} onChange={(e) => setLanguage(e.target.value as lang)}>
                        <option value="js">js</option>
                        <option value="ts" disabled>ts</option>
                        <option value="python" disabled>python</option>
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
                    highlight={source => {
                        const languageName = prismLanguage[language];
                        return Prism.highlight(source, Prism.languages[languageName], languageName);
                    }}
                    preClassName={`code-editor language-${prismLanguage[language]}`}
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
        )}

        {rightPanelType === "submissions" && (
            <ProbSubmissions />
        )}
    </div>
}

export default Problem;
