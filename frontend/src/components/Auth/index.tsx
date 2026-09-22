import { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import axios from "../../utils/config"
import { useNavigate } from "react-router-dom";

export type page = 'loginUser' | 'registerUser' | 'loginAdmin';

type pageState = [page, React.Dispatch<React.SetStateAction<string>>]

function Auth() {
    const [page, setPage] = useState('loginUser') as pageState;
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("/api/me", {
            withCredentials: true
        }).then((data) => {
            if (data.data.status === true) {
                navigate("/problems");
            }
        })
    }, []);

    return <div className="auth-shell">
        <div className="auth-layout">
            <aside className="auth-intro">
                <div className="brand-mark" aria-hidden="true">&lt;/&gt;</div>
                <span className="eyebrow">Greenroom practice</span>
                <h1>Sharpen your edge, one problem at a time.</h1>
                <p className="auth-intro-copy">A focused space to solve, submit, and grow your problem-solving instincts.</p>
                <div className="auth-proof">
                    <span className="proof-icon" aria-hidden="true">✓</span>
                    <span>Build consistency with deliberate practice</span>
                </div>
            </aside>

            <main className="auth-card">
                {page === 'loginUser' || page === 'loginAdmin' ? <LoginPage page={page}/> : <RegisterPage />}

                <div className="auth-actions">
                    {page === 'registerUser' ? <span className="auth-link" onClick={() => setPage('loginUser')}>Continue with login</span> :
                        <>
                            {page === 'loginAdmin' ? <span className="auth-link" onClick={() => setPage('loginUser')}>Continue with user login</span> :
                                <span className="auth-link" onClick={() => setPage('loginAdmin')}>Continue with admin login</span>
                            }
                            <span className="auth-link" onClick={() => setPage('registerUser')}>Create a new account</span>
                        </>
                    }
                </div>
            </main>
        </div>
    </div>
}

export default Auth;
