import { useQuery } from "@tanstack/react-query";
import axios from "../utils/config"
import { useState } from "react";
import type { problem } from "./Problem";
import { useNavigate } from "react-router-dom";

type user = {
    id: number
    name: string
    email: string
    role: 'admin' | 'user'
}

type userQuery = {
    data: user,
    isLoading: boolean,
    error: Error | null
}

function Profile() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const res = await axios.get("/api/me", {
                withCredentials: true
            });

            return res.data.data;
        }
    }) as userQuery
    const navigate = useNavigate();

    if (isLoading) return <div className="state-card"><span className="loading-orb" aria-hidden="true"></span><span>Loading profile...</span></div>

    if (error) return <div className="state-card state-error"><span className="state-icon" aria-hidden="true">!</span><span>Error loading profile</span></div>

    function handleLogout() {
        if (window.confirm("Are you sure you want to logout?")) {
            axios.get("/api/logout", {
                withCredentials: true
            }).then(res => {
                if (res.status === 200) {
                    navigate("/");
                } else {
                    alert("Error logging out");
                }
            }).catch(err => {
                alert("Error logging out");
            })
        }
    }
    return <>
        <div className="profile-page">
            <header className="profile-heading">
                <span className="eyebrow">Account</span>
                <h1>Your profile</h1>
                <p>Your practice identity and account details.</p>
            </header>
            <div className="profile-card">
                <div className="profile-avatar" aria-hidden="true">{data.name?.charAt(0).toUpperCase()}</div>
                <div className="profile-details">
                    <div className="profile-row"><span>Name</span><strong>{data.name}</strong></div>
                    <div className="profile-row"><span>Email</span><strong>{data.email}</strong></div>
                    <div className="profile-row"><span>Role</span><strong className="role-badge">{data.role}</strong></div>
                </div>
            </div>
            <br />
            <span onClick={handleLogout} style={{ cursor: "pointer", fontWeight: "bold", color: "red" }}>Logout</span>
        </div>
        {data.role === "admin" && <UploadProblem />}
    </>
}

function UploadProblem() {
    const [problem, setProblem] = useState<Omit<problem, "id">>({
        title: "",
        description: "",
        tests: [],
        functionName: "",
        returnType: "",
        inputType: ""
    });

    async function handleSubmit() {
        try {
            const res = await axios.post("/api/admin/problems", problem, {
                withCredentials: true
            });

            if (res.status === 201) {
                alert("Problem created successfully");
                setProblem({
                    title: "",
                    description: "",
                    tests: [],
                    functionName: "",
                    returnType: "",
                    inputType: ""
                });
            } else {
                alert("Error creating problem");
            }
        } catch (err) {
            alert("Error creating problem");
        }
    }

    return <div className="upload-problem-page">
        <header className="profile-heading">
            <span className="eyebrow">Admin</span>
            <h1>Upload a problem</h1>
            <p>Upload a new problem to the platform.</p>
        </header>
        <div className="upload-problem-card">
            <div className="upload-problem-row"><span>Title</span><input type="text" value={problem.title} onChange={(e) => setProblem({ ...problem, title: e.target.value })} /></div>
            <div className="upload-problem-row"><span>Description</span><textarea value={problem.description} onChange={(e) => setProblem({ ...problem, description: e.target.value })}></textarea></div>
            <div className="upload-problem-row"><span>Function Name</span><input type="text" value={problem.functionName} onChange={(e) => setProblem({ ...problem, functionName: e.target.value })} /></div>
            <div className="upload-problem-row"><span>Return Type</span><input type="text" value={problem.returnType} onChange={(e) => setProblem({ ...problem, returnType: e.target.value })} /></div>
            <div className="upload-problem-row"><span>Input Type</span><input type="text" value={problem.inputType} onChange={(e) => setProblem({ ...problem, inputType: e.target.value })} /></div>
            <div className="upload-problem-row"><span>Tests</span>
                {problem.tests.map((test, index) => (
                    <div key={index} className="test-row">
                        <input type="text" placeholder="Input" value={test.input} onChange={(e) => {
                            const newTests = [...problem.tests];
                            newTests[index].input = e.target.value;
                            setProblem({ ...problem, tests: newTests });
                        }} />
                        <input type="text" placeholder="Expected" value={test.expected} onChange={(e) => {
                            const newTests = [...problem.tests];
                            newTests[index].expected = e.target.value;
                            setProblem({ ...problem, tests: newTests });
                        }} />
                        <button onClick={() => {
                            const newTests = problem.tests.filter((_, i) => i !== index);
                            setProblem({ ...problem, tests: newTests });
                        }}>Remove</button>
                    </div>
                ))}
                <button onClick={() => setProblem({ ...problem, tests: [...problem.tests, { input: "", expected: "" }] })}>Add Test</button>
            </div>
            <button onClick={handleSubmit}>Upload Problem</button>
        </div>
    </div>
}

export default Profile;
